import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Colors } from "../../../theme";

interface LoadingOverlayProps {
  visible: boolean;
  title?: string;
  subtitle?: string;
  messages?: string[];
}

const LOADING_MESSAGES = [
  "Đang khởi động công cụ AI...",
  "Đang đọc nội dung yêu cầu của bạn...",
  "Đang phân tích và trích xuất kiến thức cốt lõi...",
  "Đang biên soạn danh sách câu hỏi trắc nghiệm...",
  "Đang xây dựng đáp án và giải thích chi tiết...",
  "Đang sắp xếp độ khó và độ dài bài học...",
  "Đang kiểm tra và hoàn thiện cấu trúc Quiz...",
  "Sắp hoàn tất! Đang đồng bộ hóa dữ liệu...",
];

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  visible,
  title = "Đang tạo Quiz bằng AI",
  subtitle = "Quá trình này thường mất khoảng 15-30 giây. Vui lòng không đóng ứng dụng hoặc quay lại.",
  messages = LOADING_MESSAGES,
}) => {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    if (!visible) {
      setMessageIndex(0);
      return;
    }

    const timer = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 4000);

    return () => clearInterval(timer);
  }, [messages.length, visible]);

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      statusBarTranslucent
    >
      <View style={styles.container}>
        <View style={styles.card}>
          <ActivityIndicator size="large" color="#4F46E5" style={styles.spinner} />
          
          <Text style={styles.title}>{title}</Text>
          
          <Text style={styles.subtitle}>{subtitle}</Text>

          <View style={styles.divider} />

          <View style={styles.messageBox}>
            <Text style={styles.messageText}>
              {messages[messageIndex]}
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.65)", // slate-900 with opacity
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: "center",
    width: Math.min(width - 48, 360),
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.12,
    shadowRadius: 30,
    elevation: 8,
    borderWidth: 1,
    borderColor: "rgba(226, 232, 240, 0.8)",
  },
  spinner: {
    marginBottom: 20,
  },
  title: {
    fontSize: 19,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(226, 232, 240, 0.8)",
    width: "100%",
    marginBottom: 16,
  },
  messageBox: {
    minHeight: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  messageText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.primary.DEFAULT,
    textAlign: "center",
  },
});
