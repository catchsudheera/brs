package com.brs.coordinator_backend.aws.dto;

import java.util.List;

/**
 *
 * {
 *     "id": "5998980997863965597",
 *     "question": "New Poll",
 *     "options": [
 *         {
 *             "text": "Yes",
 *             "voter_count": 1
 *         },
 *         {
 *             "text": "No",
 *             "voter_count": 1
 *         }
 *     ],
 *     "total_voter_count": 2,
 *     "is_closed": false,
 *     "is_anonymous": false,
 *     "type": "regular",
 *     "allows_multiple_answers": false
 * }
 */
public record PollStatus(String id, String question, List<PollOptionResult> options, int totalVoterCount, boolean isClosed, boolean isAnonymous, String type, boolean allowsMultipleAnswers) {
}
