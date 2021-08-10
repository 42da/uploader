package com.home.project.uploader;

import java.io.*;

import javax.servlet.ServletInputStream;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import java.util.*;
import java.awt.print.PrinterAbortException;

import com.oreilly.servlet.multipart.DefaultFileRenamePolicy;
import com.oreilly.servlet.MultipartRequest;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;

import org.apache.commons.io.FileUtils;
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
		String saveDirectory = "D:\\upload_path\\";
		String tempDirectory = "D:\\temp\\";
		System.out.println(saveDirectory);
		int maxSize = 1024 * 1024 * 5;
		String encoding = "UTF-8";
		
		System.out.println(request.getHeader("header"));
		
//		MultipartRequest multi = new MultipartRequest(request, tempDirectory, maxSize, encoding, new DefaultFileRenamePolicy());
		MultipartRequest multi = new MultipartRequest(request, tempDirectory, maxSize, encoding);
		String fileInfo = multi.getParameter("fileInfo0");
		
		
		try {
			JSONParser parser = new JSONParser();
			Object obj = parser.parse(fileInfo);
			JSONObject jsonObj = (JSONObject) obj;
			boolean divUpload = "1".equals(jsonObj.get("divUpload"));
			
			Enumeration files = multi.getFileNames();
			String item = (String) files.nextElement();
			String ofileName = multi.getOriginalFileName(item);
			if (!divUpload) {
//				String fileName = multi.getFilesystemName(item);
				
				FileInputStream temp_file = new FileInputStream(tempDirectory + ofileName);
				FileOutputStream main_file = new FileOutputStream(saveDirectory + ofileName);
				int i = 0;
				while((i = temp_file.read()) != -1) {
					main_file.write(i);
				}
				temp_file.close();
				main_file.close();
			} else {
				boolean first = "1".equals(jsonObj.get("first"));
				boolean last = "1".equals(jsonObj.get("last"));
				if (first) {
					int size = ((Long) jsonObj.get("size")).intValue();
					String guid = (String) jsonObj.get("GUID");
					
					RandomAccessFile guid_file = new RandomAccessFile(tempDirectory + guid + ".txt", "rw");
					guid_file.writeChars(guid);
					
					String blob = multi.getFilesystemName(item);
					FileInputStream chunk_file = new FileInputStream(tempDirectory + blob);
					
					RandomAccessFile main_file = new RandomAccessFile(saveDirectory + ofileName, "rw");
					main_file.setLength(size);
					
					guid_file.close();
					chunk_file.close();
					main_file.close();
					
					response.setContentType("text/plain");
					response.setCharacterEncoding("utf8");
					PrintWriter out = response.getWriter();
					out.println("uploading");
					
				} else if (last) {
					
				} else {
					
				}
				
			}
		} catch (Exception e) {
			System.out.println("fail");
		}
		
//		try {
//			JSONParser parser = new JSONParser();
//			Object obj = parser.parse(fileInfo);
//			JSONObject jsonObj = (JSONObject) obj;
//			
//			String guid = (String) jsonObj.get("GUID");
//			System.out.println(guid);
//			int size = ((Long) jsonObj.get("size")).intValue();	// simple json => long으로 리턴
//			System.out.println(size);
//			String fileName = (String) jsonObj.get("name");
//			String extension = (String) jsonObj.get("extension");
//			Enumeration files = multi.getFileNames();
//			String item = (String) files.nextElement();
//			String ofileName = multi.getOriginalFileName(item);
//			String blob = multi.getFilesystemName(item);
//			System.out.println(fileName);
//			System.out.println(extension);
//			System.out.println(tempDirectory + fileName + extension);
//			
//			FileInputStream chunk_file = new FileInputStream(tempDirectory + blob);
//
//			RandomAccessFile main_file = new RandomAccessFile(saveDirectory + fileName + extension, "rw");
//			
//			main_file.setLength(size);
//			
//			int i = 0;
//			while((i = chunk_file.read()) != -1) {
//				main_file.write(i);
//			}
//			chunk_file.close();
//			main_file.close();
//		} catch (Exception e) {
//			System.out.println("fail");
//		}
		
		System.out.println("success");
		
		
		
		
		
//		byte[] byteArray = FileUtils.readFileToByteArray(new File(tempDirectory + fileName));
//		FileUtils.writeByteArrayToFile(new File(saveDirectory + fileName), byteArray, true); // fileUtil 이어 쓰기 (마지막 true)
//		while (files.hasMoreElements()) {
//			String item = (String) files.nextElement();
//			String ofileName = multi.getOriginalFileName(item);
//			String fileName = multi.getFilesystemName(item);
			
//			System.out.println(item);
//			System.out.println(ofileName);
//			System.out.println(fileName);
			
			// file 쓰기
			
//			byte[] byteArray = FileUtils.readFileToByteArray(new File(tempDirectory + fileName));
//			FileUtils.writeByteArrayToFile(new File(saveDirectory + fileName), byteArray, true); // fileUtil 이어 쓰기 (마지막 true)
//		}
		response.setContentType("text/plain");
		response.setCharacterEncoding("utf8");
		PrintWriter out = response.getWriter();
		out.println(saveDirectory);
		

	    
//		doGet(request, response);
	}

}
