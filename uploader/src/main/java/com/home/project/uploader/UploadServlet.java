package com.home.project.uploader;

import java.io.IOException;

import javax.servlet.ServletInputStream;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import java.util.Enumeration;
import java.io.DataInputStream;

import com.oreilly.servlet.multipart.DefaultFileRenamePolicy;
import com.oreilly.servlet.MultipartRequest;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
/*
 * Servlet implementation class UploadServlet
 */
@WebServlet("/UploadServlet")
public class UploadServlet extends HttpServlet {
	private static final long serialVersionUID = 1L;
       
    /**
     * @see HttpServlet#HttpServlet()
     */
    public UploadServlet() {
        super();
        // TODO Auto-generated constructor stub
    }

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		// TODO Auto-generated method stub
		response.getWriter().append("Served at: ").append(request.getContextPath());
	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		// TODO Auto-generated method stub
		System.out.println("post");
		request.setCharacterEncoding("utf-8");
		String saveDirectory = "D:\\upload_path";
		System.out.println(saveDirectory);
		int maxSize = 1024 * 1024 * 5;
		String encoding = "UTF-8";
		
		MultipartRequest multi = new MultipartRequest(request, saveDirectory, maxSize, encoding, new DefaultFileRenamePolicy());
		String fileInfo = multi.getParameter("fileInfo");
		try {
			JSONParser parser = new JSONParser();
			Object obj = parser.parse(fileInfo);
			JSONObject jsonObj = (JSONObject) obj;
			String size = (String) jsonObj.get("GUID");
			System.out.println(size);
			System.out.println("json parsing");
			
		}
		catch (Exception e) {
			System.out.println("fail");
			//
		}
		
		
		System.out.println("success");
		
		Enumeration files = multi.getFileNames();
		
		String item = (String) files.nextElement();
		String ofileName = multi.getOriginalFileName(item);
		String fileName = multi.getFilesystemName(item);
		
		System.out.println(item);
		System.out.println(ofileName);
		System.out.println(fileName);
		
//		System.out.println();
//		doGet(request, response);
	}

}
