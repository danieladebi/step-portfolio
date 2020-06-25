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

package com.google.sps.servlets;

import java.io.IOException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.gson.Gson;
import java.util.ArrayList;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.datastore.Query.SortDirection;

/** Servlet that returns some example content. TODO: modify this file to handle comments data */
@WebServlet("/data")
public class DataServlet extends HttpServlet {
  
  private ArrayList<String> commentsList = new ArrayList<String>();
  private int maxCommentCount;

  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {

    Query query = new Query("Comment").addSort("timestamp", SortDirection.DESCENDING);

    DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
    PreparedQuery results = datastore.prepare(query);

    ArrayList<String> comments = new ArrayList<>();

    maxCommentCount = getMaxComments(request);
    if (maxCommentCount == -1) {
        //maxCommentCount = 1;
        response.setContentType("text/html");
        response.getWriter().println("Please enter an integer between 1 and 3.");
 
        return;
    }

    int count = 0;
    for (Entity entity : results.asIterable()) {
        if (count < maxCommentCount) {
            long id = entity.getKey().getId();
            String content = (String) entity.getProperty("content");
            long timestamp = (long) entity.getProperty("timestamp");
            
            comments.add("\"" + content + "\"");
            count += 1;
        } else {
            break;
        }
    }

    response.setContentType("application/json;");
    response.getWriter().println(convertToJson(comments));
  }
  
  @Override
  public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {

    // Get the input from the form.
    response.setContentType("text/html");

    String text = request.getParameter("comment-input");
    commentsList.add("\"" + text + "\"");

    long timestamp = System.currentTimeMillis();

    // Send data to Datastore
    Entity commentEntity = new Entity("Comment");
    DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
    commentEntity.setProperty("content", text);
    commentEntity.setProperty("timestamp", timestamp);
    datastore.put(commentEntity);

    // Redirect back to the HTML page.
    response.sendRedirect("/index.html");
  }

  private String convertToJson(ArrayList<String> comments) {
    String json = "{ ";
    json += "\"comments\": " + comments + " }";  
    return json;
  }

  private int getMaxComments(HttpServletRequest request) {
    String maxCommentsString = request.getParameter("max-comments");

    int maxCommentCount;
    try {
      maxCommentCount = Integer.parseInt(maxCommentsString);
    } catch (NumberFormatException e) {
      System.err.println("Could not convert to int: " + maxCommentsString);
      return -1;
    }

    if (maxCommentCount < 1) {
      System.err.println("Option is out of range: " + maxCommentsString);
      return -1;
    }
    
    return maxCommentCount; 
  }
}
