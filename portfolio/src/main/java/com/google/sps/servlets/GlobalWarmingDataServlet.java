package com.google.sps.servlets;

import com.google.gson.Gson;
import java.io.IOException;
import java.util.LinkedHashMap;
import java.util.Scanner;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/global-warming")
public class GlobalWarmingDataServlet extends HttpServlet {

    private LinkedHashMap<Integer, Double> globalWarmingTemps = new LinkedHashMap<>();

    @Override
    public void init() {
        Scanner scanner = new Scanner(getServletContext().getResourceAsStream(
        "/WEB-INF/globalwarming.csv"));
        while (scanner.hasNextLine()) {
            String line = scanner.nextLine();
            String[] cells = line.split(",");

            Integer year = Integer.valueOf(cells[0]);
            Double temps = Double.valueOf(cells[1]);

            globalWarmingTemps.put(year, temps);
        }
        scanner.close();
    }

    @Override
    public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        response.setContentType("application/json");
        Gson gson = new Gson();
        String json = gson.toJson(globalWarmingTemps);
        response.getWriter().println(json);
    }

}