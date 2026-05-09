package com.mbstu.diningpass.meal.dto.response.summary;
import java.time.LocalDateTime;
import java.util.UUID;

public record StudentMealSummaryResponse(

        UUID   studentId,
        String hallShortName,
        Long   totalTokensPurchased,
        Long   totalTokensUsed,
        Long   totalTokensUnused,
        Long   totalSpent,              // total taka paid all time
        LocalDateTime updatedAt

) {}