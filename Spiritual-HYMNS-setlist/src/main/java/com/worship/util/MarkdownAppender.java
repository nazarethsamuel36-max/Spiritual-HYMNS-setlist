package com.worship.util;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;

public class MarkdownAppender {
    public static void main(String[] args) {
        if (args.length < 2) {
            System.err.println("Usage: java MarkdownAppender <filepath> <content...>");
            return;
        }

        String filePath = args[0];
        StringBuilder content = new StringBuilder();
        for (int i = 1; i < args.length; i++) {
            content.append(args[i]).append(" ");
        }

        File file = new File(filePath);
        file.getParentFile().mkdirs();

        try (FileWriter fw = new FileWriter(file, true)) {
            fw.write(content.toString().replace("\\n", "\n"));
            System.out.println("Appended " + content.length() + " chars to " + filePath);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
