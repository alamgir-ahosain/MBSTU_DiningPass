package com.mbstu.diningpass.auth.service.abstraction;

import com.mbstu.diningpass.auth.dto.request.hall.CreateHallRequest;
import com.mbstu.diningpass.auth.dto.response.hall.HallResponse;

import java.util.List;
import java.util.UUID;

public interface HallService {
    public HallResponse createHall(CreateHallRequest request);
    public HallResponse getHallById(UUID hallId);
    public HallResponse updateHall(UUID hallId, CreateHallRequest request);
    public void deleteHall(UUID hallId);
    public List<HallResponse> getAllActiveHall();
    public List<HallResponse> getAllHall();
    public HallResponse getHallByShortName(String shortName);

}
