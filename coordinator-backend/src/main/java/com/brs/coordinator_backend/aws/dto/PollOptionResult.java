package com.brs.coordinator_backend.aws.dto;

/**
 *
 * {
*     "text": "Yes",
*     "voter_count": 1
*  }
 */
public record PollOptionResult(String text, int voterCount) {
}
