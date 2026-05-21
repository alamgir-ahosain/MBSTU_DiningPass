package com.mbstu.diningpass.meal.service.abstraction;

import com.mbstu.diningpass.meal.dto.request.qr.StaffScanRequest;
import com.mbstu.diningpass.meal.dto.response.qr.QrScanResponse;
import com.mbstu.diningpass.meal.enums.Role;

import java.util.UUID;

public interface QrScanService {

    QrScanResponse staffScan(UUID staffId, Role staffRole, StaffScanRequest request);
}
