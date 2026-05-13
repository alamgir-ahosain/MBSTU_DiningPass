package com.mbstu.diningpass.auth.service.abstraction;

import com.mbstu.diningpass.auth.dto.request.hall.CreateHallRequest;
import com.mbstu.diningpass.auth.dto.response.hall.HallResponse;
import com.mbstu.diningpass.auth.enums.Role;

import java.util.List;
import java.util.UUID;

public interface HallService {

    HallResponse createHall(UUID requesterId, Role role, CreateHallRequest request);
    HallResponse updateHall(UUID requesterId, Role role, UUID id, CreateHallRequest request);
    List<HallResponse> getAllHalls(UUID requesterId, Role role, boolean activeOnly);
    HallResponse getHallById(UUID requesterId, Role role, UUID id);
    HallResponse getHallByShortName(UUID requesterId, Role role, String shortName);
    void updateHallStatus(UUID requesterId, Role role, UUID id) ;
    Long countHalls(UUID requesterId, Role role);
}
