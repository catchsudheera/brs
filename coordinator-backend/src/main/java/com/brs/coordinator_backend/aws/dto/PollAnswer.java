package com.brs.coordinator_backend.aws.dto;

import java.util.List;

/**
 *  {
 *         "poll_id": "5998980997863965597",
 *         "user": {
 *             "id": 551068137,
 *             "is_bot": false,
 *             "first_name": "Amila Banuka",
 *             "username": "amilabanuka"
 *         },
 *         "option_ids": [
 *             0
 *         ]
 *     }
 */
public record PollAnswer(String pollId, User user, List<Integer> optionIds) {
}
