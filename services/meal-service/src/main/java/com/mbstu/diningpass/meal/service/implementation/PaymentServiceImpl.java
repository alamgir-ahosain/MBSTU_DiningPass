//package com.mbstu.diningpass.meal.service.implementation;
//
//
//
//    // Approve payment — evict the student's token list (new tokens created)
//    // and all mealConfigs lists (totalSold updated on MealConfig)
//    @Override
//    @Transactional
//    @Caching(evict = {
//            @CacheEvict(value = "mealTokens",  allEntries = true),  // student tokens changed
//            @CacheEvict(value = "mealConfigs", allEntries = true)   // totalSold changed
//    })
//    public PaymentAdminResponse approvePayment(UUID requesterId, Role requesterRole, UUID paymentId) {
//
//        logger.warn("meal-service/payment: DIRECT DB CALL for approvePayment");
//
//        Payment payment = paymentRepository.findById(paymentId)
//                .orElseThrow(() -> new ResourceNotFoundException("Payment not found"));
//
//        if (payment.getPaymentStatus() != PaymentStatus.SUBMITTED) {
//            payment.setRejectionReason("Payment is not in a state that can be approved");
//            paymentRepository.save(payment);
//            throw new BadRequestException("Payment already processed");
//        }
//
//
//        // final duplicate protection
//        for (MealType mealType : payment.getMealTypes()) {
//
//
//            boolean exists =
//                    mealTokenRepository
//                            .existsByStudentIdAndMealDateAndMealType(
//                                    payment.getStudentId(),
//                                    payment.getMealDate(),
//                                    mealType
//                            );
//
//            if (exists) {
//                payment.setRejectionReason("Token already exists for " + mealType);
//                logger.info("Payment rejected for student id={} due to duplicate token", payment.getStudentId());
//                throw new BadRequestException("Token already exists for " + mealType);
//            }
//        }
//
//
//        // create tokens
//        for (MealType mealType : payment.getMealTypes()) {
//
//            MealConfig mealConfig = mealConfigRepository
//                    .findByHallShortNameAndMealDateAndMealType(
//                            payment.getHallShortName(),
//                            payment.getMealDate(),
//                            mealType
//                    )
//                    .orElseThrow(() -> new ResourceNotFoundException("Meal config not found"));
//
//            mealConfig.setTotalSold(mealConfig.getTotalSold() + 1);
//            mealConfigRepository.save(mealConfig);
//
//            MealToken token = MealToken.builder()
//                    .paymentId(payment.getId())
//                    .studentId(payment.getStudentId())
//                    .hallShortName(payment.getHallShortName())
//                    .mealDate(payment.getMealDate())
//                    .mealType(mealType)
//                    .mealPrice(mealConfig.getMealPrice())
//                    .tokenStatus(TokenStatus.APPROVED)
//                    .build();
//
//            MealToken savedToken = mealTokenRepository.save(token);       // ID assigned now
//            String qrData=qrTokenService.generateMealQrToken(savedToken, mealConfig.getTokenExpires());
//            savedToken.setQrCodeData(qrData);
//            savedToken.setQrGeneratedAt(LocalDateTime.now());
//
//            logger.info("QR code generated for meal token id={}", savedToken.getId());
//
//            hallMealSummaryService.onPaymentApproved(
//                    payment.getHallShortName(),
//                    payment.getMealDate(),
//                    mealType,
//                    mealConfig.getMealPrice(),   // per-meal price, not totalAmount
//                    mealConfig.getMealMenu(),
//                    mealConfig.getFeastNote()
//            );
//            mealTokenRepository.save(savedToken);
//        }
//
//
//
//        HallAssociateProfileResponse profileResponse= hallAssociateFeignClient.getMyProfile();
//
//        payment.setPaymentStatus(PaymentStatus.VERIFIED);
//        payment.setVerifiedByName(profileResponse.fullName());
//        payment.setVerifiedAt(LocalDateTime.now());
//
//        logger.info("Payment approved for student id={}", payment.getStudentId());
//        paymentRepository.save(payment);
//
//        // when admin verified payment then button will be showed be varified
//        return new PaymentAdminResponse(
//                payment.getVerifiedByName(),
//                payment.getVerifiedAt()
//        );
//
//    }
//
//
//
//    //  NOT cached (Page<> + changes every cutToken submission)
//    @Override
//    public Page<PaymentResponse> getAllPayment(UUID requesterId, Role requesterRole, int page, int size) {
//
//        Pageable pageable = PageRequest.of(page, size, Sort.by("submittedAt").ascending());
//
//        // Role guard
//        if (requesterRole != Role.HALL_ADMIN && requesterRole != Role.HALL_STAFF) {
//            throw new ForbiddenException("Only Hall Admins and Hall Staff can view payments");
//        }
//
//        // Scope to requester's hall
//        HallAssociateProfileResponse profile = hallAssociateFeignClient.getMyProfile();
//
//        if (profile.hallShortName() == null) {
//            throw new ForbiddenException("Your account has no hall assigned. Contact a Super Admin.");
//        }
//
//        Page<Payment> payments = paymentRepository.findByHallShortNameAndStatus(
//                profile.hallShortName(),
//                PaymentStatus.SUBMITTED,
//                pageable
//        );
//
//        logger.info("[GET_ALL_PAYMENTS] hall={} page={} size={} total={}",
//                profile.hallShortName(),
//                pageable.getPageNumber(),
//                pageable.getPageSize(),
//                payments.getTotalElements()
//        );
//
//        return payments.map(payment -> new PaymentResponse(
//                payment.getId(),
//                payment.getStudentId(),
//                payment.getHallShortName(),
//                payment.getMealDate(),
//                payment.getMealTypes(),
//                payment.getTotalAmount(),
//                payment.getPaymentMethod(),
//                payment.getSenderNumber(),
//                payment.getScreenshotUrl(),
//                payment.getPaymentStatus(),
//                payment.getRejectionReason(),
//                payment.getVerifiedByName(),
//                payment.getVerifiedAt(),
//                payment.getSubmittedAt()
//        ));
//    }
//
//
//    @Override
//    public PaymentRejectionResponse rejectPayment(UUID requesterId, Role requesterRole, UUID paymentId, PaymentRejectRequest request) {
//
//        Payment existingPayment = paymentRepository.findById(paymentId)
//                .orElseThrow(() -> {
//                    logger.warn("Payment not found for rejection, paymentId={}", paymentId);
//                    return new ResourceNotFoundException("Payment not found");
//                });
//
//        // Status guard
//        if (existingPayment.getPaymentStatus() != PaymentStatus.SUBMITTED) {
//            logger.warn("Rejection attempted on non-SUBMITTED payment, paymentId={}, status={}", existingPayment.getId(), existingPayment.getPaymentStatus());
//            throw new IllegalStateException("Payment cannot be rejected. Current status: " + existingPayment.getPaymentStatus());
//        }
//
//        // Scope to requester's hall
//        HallAssociateProfileResponse profile = hallAssociateFeignClient.getMyProfile();
//
//        if (profile.hallShortName() == null) {
//            throw new ForbiddenException("Your account has no hall assigned. Contact a Super Admin.");
//        }
//
//        // Hall-scope access check
//        if (requesterRole == Role.HALL_ADMIN || requesterRole == Role.HALL_STAFF) {
//            if (!existingPayment.getHallShortName().equals(profile.hallShortName())) {
//                logger.warn("Unauthorized rejection attempt by userId={} on paymentId={}", requesterId, existingPayment.getId());
//                throw new ForbiddenException("You can only reject payments from your own hall");
//            }
//        }
//
//        existingPayment.setRejectionReason(request.rejectionReason());
//        existingPayment.setPaymentStatus(PaymentStatus.REJECTED);
//
//        Payment saved = paymentRepository.save(existingPayment);
//        logger.info("Payment rejected, paymentId={}, studentId={}, rejectedBy={}", saved.getId(), saved.getStudentId(), requesterId);
//
//        return new PaymentRejectionResponse(
//                saved.getId(),
//                saved.getStudentId(),
//                saved.getMealDate(),
//                saved.getMealTypes(),
//                saved.getTotalAmount(),
//                saved.getPaymentMethod(),
//                saved.getSenderNumber(),
//                saved.getScreenshotUrl(),
//                saved.getPaymentStatus(),
//                saved.getRejectionReason(),
//                saved.getSubmittedAt()
//        );
//    }
//
//
//
//    @Override
//    public List<PaymentResponse> getMyPayments(UUID requesterId, Role requesterRole) {
//
//        if (requesterRole != Role.STUDENT) {
//            logger.warn("Non-student attempted to access student payments, userId={}, role={}", requesterId, requesterRole);
//            throw new ForbiddenException("Only students can view their payments");
//        }
//
//        List<Payment> payments = paymentRepository.findByStudentId(requesterId);
//
//        logger.info("Fetched {} payments for studentId={}", payments.size(), requesterId);
//
//        return payments.stream()
//                .map(this::mapToPaymentResponse)
//                .toList();
//    }
//
//    private PaymentResponse mapToPaymentResponse(Payment payment) {
//        return new PaymentResponse(
//                null,
//                null,
//                null,
//                payment.getMealDate(),
//                payment.getMealTypes(),
//                payment.getTotalAmount(),
//                payment.getPaymentMethod(),
//                payment.getSenderNumber(),
//                payment.getScreenshotUrl(),
//                payment.getPaymentStatus(),
//                payment.getRejectionReason(), null , null ,
//                payment.getSubmittedAt()
//        );
//    }
//
//
//
//}