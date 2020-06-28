// Copyright 2019 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package com.google.sps;

import java.util.Collection;
import java.util.Collections;
import java.util.ArrayList;
import java.util.Set;
import java.util.HashSet;
import java.util.HashMap;
import java.util.Map;

public final class FindMeetingQuery {
    public Collection<TimeRange> query(Collection<Event> events, MeetingRequest request) {

        Collection<TimeRange> validTimes = new ArrayList<>();

        // If request covers more than a day, return no valid time.
        if (request.getDuration() > TimeRange.WHOLE_DAY.duration()) {
            return validTimes;
        }

        long requestDuration = request.getDuration();

        // Get all times where a mandatory guest can't make it.
        Collection<TimeRange> invalidTimes = checkConflicts(events, request);
        
        Collections.sort((ArrayList) invalidTimes, TimeRange.ORDER_BY_START);

        if (invalidTimes.isEmpty()) {
            validTimes.add(TimeRange.WHOLE_DAY);
            return validTimes;
        }

        // Loop through each of the time conflicts
        // to determine which time ranges are available.
        // Only add time ranges that have a valid
        // duration length. 
        int startTime = TimeRange.START_OF_DAY;
        int endTime = TimeRange.START_OF_DAY;
        TimeRange prevTimeRange = TimeRange.fromStartEnd(startTime, endTime, false);
        for (TimeRange timeRange : invalidTimes) {
            if (prevTimeRange.contains(timeRange)) {
                prevTimeRange = timeRange;
                continue;
            }
            if (prevTimeRange.overlaps(timeRange)) {
                startTime = timeRange.end();
                endTime = timeRange.end();
                prevTimeRange = timeRange;
                continue;
            }
            endTime = timeRange.start();
            TimeRange potentialTimeRange = TimeRange.fromStartEnd(startTime, endTime, false);
            if (potentialTimeRange.duration() >= requestDuration) {
                validTimes.add(potentialTimeRange);
            }
            startTime = timeRange.end();
            prevTimeRange = timeRange;
        }

        TimeRange lastTime = TimeRange.fromStartEnd(startTime, TimeRange.END_OF_DAY, true);
        if (lastTime.duration() >= requestDuration) {
            validTimes.add(lastTime);
        }

        return validTimes;
    }

    // Loop through each event and check where overlaps are between
    // mandatory attendees's prior commitments.
    private Collection<TimeRange> checkConflicts(Collection<Event> events, MeetingRequest request) {
        Collection<TimeRange> invalidTimes = new ArrayList<>();
        Collection<String> requestAttendees = new ArrayList<String>(request.getAttendees());

        for (Event event : events) {
            TimeRange eventTime = event.getWhen();
            Set<String> eventAttendees = new HashSet<String>(event.getAttendees());
            System.out.println("Event Time: " + eventTime);
            System.out.println("Event Attendees: " + eventAttendees);

            for (String attendee : requestAttendees) {
                if (eventAttendees.contains(attendee)) {
                    invalidTimes.add(eventTime);
                    break;
                }
            }
        }

        return invalidTimes;
    }
}