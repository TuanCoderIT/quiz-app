export const formatDate = (date?: string) => {
  if (!date) return "Chọn ngày sinh";

  const d = new Date(date);

  return d.toLocaleDateString("vi-VN");
};

