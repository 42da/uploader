package com.home.project.uploader;

import java.io.*;

import java.net.URLConnection;
import java.net.URLEncoder;
import java.nio.charset.Charset;

import javax.servlet.*;
import javax.servlet.http.*;
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
import org.apache.commons.fileupload.MultipartStream;
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

		request.setCharacterEncoding("utf-8");
//		String saveDirectory = "C:\\uploader\\upload_path\\";
//		String tempDirectory = "C:\\uploader\\temp\\";
		String saveDirectory = "D:\\upload_path\\";
		String tempDirectory = "D:\\temp\\";

		String path = "";
		
		int maxSize = 1024 * 1024 * 1024;
		String encoding = "UTF-8";
		
		int data = 0;
		int bufferLength = 8 * 1024;
		byte[] buf = new byte[bufferLength];		// 1024 or 8 * 1024
		
//		MultipartRequest multi = new MultipartRequest(request, tempDirectory, maxSize, encoding, new DefaultFileRenamePolicy());
		MultipartRequest multi = new MultipartRequest(request, tempDirectory, maxSize, encoding);
		
		String mode = multi.getParameter("mode");
		String guid = multi.getParameter("GUID");
		
		
		if (mode.equals("download")) {
			path = multi.getParameter("path0");
			String ofileName = multi.getParameter("originalName0");
			
			String userAgent = request.getHeader("User-Agent");
			
			if(userAgent.indexOf("Trident") > -1 || userAgent.indexOf("MSIE") > -1) { //IE
				if(userAgent.indexOf("Trident/7") > -1 || userAgent.indexOf("Trident/6") > -1) {
					response.setHeader("Content-Disposition", "attachment; filename=" + java.net.URLEncoder.encode(ofileName, "UTF-8") + ";");
				} 
			}
			else {
				ofileName = new String(ofileName.getBytes("UTF-8"), "ISO-8859-1");		// 크롬 한글 깨짐 (브라우저마다 해결 방식 다름)
				response.setHeader("Content-Disposition", "attachment; filename=" + ofileName);
			}

			response.setContentType("application/octet-stream; charset=UTF-8");
			response.setHeader("Content-Transfer-Encoding", "binary");

			File pfile = null;				// 현재 진행률을 공유하기 위한 file(guid.txt 형태로 저장)
			FileOutputStream fos = null;
			File file = null;
			FileInputStream fis = null;
			BufferedInputStream bis = null;
			BufferedOutputStream bos = null;

			try {
				
				file = new File(path);
				fis = new FileInputStream(file);
				bis = new BufferedInputStream(fis);

				bos = new BufferedOutputStream(response.getOutputStream());
				int cur = 0;
				
				while ((data = fis.read(buf)) != -1) {

					cur += data;
					pfile = new File(tempDirectory + guid +".txt");
					fos = new FileOutputStream(pfile);
					fos.write(Integer.toString(cur).getBytes());
					fos.close();
					bos.write(buf, 0, data);

				}
			} catch(Exception ex) {
				ex.toString();
			} finally {
				try {
					if (bis != null) bis.close();
					if (fis != null) fis.close();
					if (bos != null) bos.close();
				} catch (Exception ex) {
					ex.printStackTrace();
				}
			}
			
		} else if (mode.equals("progress")) {
			long fullSize = Long.parseLong(multi.getParameter("fullSize"));
			File file = null;
			FileReader fr = null;
			BufferedReader br = null;

			response.setContentType("text/plain");
			response.setCharacterEncoding("utf8");
			PrintWriter out = response.getWriter();
			try {
				file = new File(tempDirectory + guid + ".txt");
				fr = new FileReader(file);
				br = new BufferedReader(fr);

				String readData = "";
				String cur = "";
				
				while ((readData = br.readLine()) != null) cur = readData;
				
				if (cur.equals("")) out.println("-1");
				else if (Long.parseLong(cur) == fullSize) {		// download 끝나면 guid 파일 삭제

					br.close();
					fr.close();
					file.delete();
					out.println(cur);
				}
				else out.println(cur);
				
			} catch(Exception ex) {
				out.println("0");
				ex.toString();
			} finally {
				try {
					if (br != null) br.close();
					if (fr != null) fr.close();
				} catch (Exception ex) {
					ex.printStackTrace();
				}
			}

		} else {
			long start = Long.parseLong(multi.getParameter("start"));
			String ext = multi.getParameter("extension");
			boolean divUpload = Boolean.parseBoolean(multi.getParameter("divUpload"));
			boolean first = Boolean.parseBoolean(multi.getParameter("first"));
			boolean last = Boolean.parseBoolean(multi.getParameter("last"));
			long fullSize = Long.parseLong(multi.getParameter("fullSize"));

			if (first) {
				RandomAccessFile main_file = null;
				FileOutputStream tmp_path = null;
				path = saveDirectory + guid + ext;

				try {
					main_file = new RandomAccessFile(path, "rw");
					main_file.setLength(fullSize);
					
					File file = new File(tempDirectory + guid + ".txt");
					tmp_path = new FileOutputStream(file);
					tmp_path.write(path.getBytes());
				} catch(Exception ex) {
					
				} finally {
					try {
						if (main_file != null) main_file.close();
						if (tmp_path != null) tmp_path.close();
					} catch (Exception ex) {
						ex.printStackTrace();
					}
				}		

			} else {
				FileInputStream tmp_path = null;
				try {
					File file = new File(tempDirectory + guid + ".txt");
					tmp_path = new FileInputStream(file);
					int ch = 0;
					while((ch = tmp_path.read()) != -1) path += (char)ch;		// path setting -> 형 변환 후 main_file.write() 안되던 오류 없어짐.
				} catch(Exception ex) {
					
				} finally {
					try {
						if (tmp_path != null) tmp_path.close();
					} catch (Exception ex) {
						ex.printStackTrace();
					}
				}
			}
			
			// write
			File file = null;
			RandomAccessFile main_file = null;
			FileInputStream chunk_file = null;
			
			try {
				file = new File(path);
				
				main_file = new RandomAccessFile(file, "rw");
				main_file.seek(start);
				
				chunk_file = new FileInputStream(tempDirectory + guid);			// client에서 form data로 파일 보낼 때 guid로 보내도록 설정했기 때문에 단일이든 분할이든 상관 무
					
				while ((data = chunk_file.read(buf)) != -1) main_file.write(buf, 0, data);
				
			} catch(Exception ex) {
				ex.toString();
			} finally {
				try {
					if (chunk_file != null) chunk_file.close();
					if (main_file != null) main_file.close();
				} catch (Exception ex) {
					ex.printStackTrace();
				}
			}
			
			// not divupload or last chunk 
			File tmp_path = null;
			File tmp_file = null;

			if (!divUpload || last) {
				try {
					tmp_path = new File(tempDirectory + guid + ".txt");
					tmp_file = new File(tempDirectory + guid);
				} catch(Exception ex) {
					ex.toString();
				} finally {
					try {
						if (tmp_path != null) tmp_path.delete();
						if (tmp_file != null) tmp_file.delete();
					} catch (Exception ex) {
						ex.printStackTrace();
					}
				}
			}
			if (first) {	
				response.setContentType("text/plain");
				response.setCharacterEncoding("utf8");
				PrintWriter out = response.getWriter();
				out.println(path);
			}
		}

//		doGet(request, response);
	}
}
		