package com.mbstu.diningpass.auth.service.abstraction;

import com.mbstu.diningpass.auth.dto.request.hallassociate.HallAssociateRegistrationRequest;
import com.mbstu.diningpass.auth.dto.request.hallassociate.UpdateHallAssociateProfileRequest;
import com.mbstu.diningpass.auth.dto.request.student.SuspendStudentRequest;
import com.mbstu.diningpass.auth.dto.response.MessageResponse;
import com.mbstu.diningpass.auth.dto.response.hallassociate.HallAssociateAdminResponse;
import com.mbstu.diningpass.auth.dto.response.hallassociate.HallAssociateProfileResponse;
import com.mbstu.diningpass.auth.enums.Role;

import java.util.List;
import java.util.Map;
import java.util.UUID;

public interface HallAssociateService {

     HallAssociateAdminResponse create(UUID requesterId, Role requesterRole, HallAssociateRegistrationRequest request);
     HallAssociateProfileResponse getMyProfile(UUID requesterId, Role role);
     HallAssociateAdminResponse getById(UUID requesterId, Role role, UUID targetId);
     MessageResponse updateStatus(UUID requesterId, Role role, UUID targetId);
     List<HallAssociateAdminResponse> getAccounts(UUID requesterId, Role requesterRole, Role filterRole, UUID hallId);
     HallAssociateProfileResponse updateMyProfile(UUID requesterId, Role role, UpdateHallAssociateProfileRequest request) ;
     Map<String, Long> countAccounts(UUID requesterId, Role requesterRole);
}