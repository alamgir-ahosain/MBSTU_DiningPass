package com.mbstu.diningpass.auth.service.abstraction;

import com.mbstu.diningpass.auth.dto.request.hallassociate.HallAssociateRegistrationRequest;
import com.mbstu.diningpass.auth.dto.request.student.SuspendStudentRequest;
import com.mbstu.diningpass.auth.dto.response.MessageResponse;
import com.mbstu.diningpass.auth.dto.response.hallassociate.HallAssociateResponse;
import com.mbstu.diningpass.auth.enums.Role;

import java.util.List;
import java.util.UUID;

public interface HallAssociateService {

    public HallAssociateResponse create(UUID requesterId, Role requesterRole, HallAssociateRegistrationRequest request);
    public HallAssociateResponse getById(UUID requesterId, Role role, UUID targetId);
    public MessageResponse suspend(UUID requesterId, Role role, UUID targetId, SuspendStudentRequest request) ;
    public List<HallAssociateResponse> getAccounts(UUID requesterId, Role requesterRole, Role filterRole, UUID hallId);
}