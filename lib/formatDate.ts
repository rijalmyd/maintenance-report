export const formatDateID = (date: string | Date | null) => {
  if (!date) return "-";

  const d = new Date(date);

  const dd = String(d.getDate()).padStart(2, "0");

  const monthNames = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  const monthName = monthNames[d.getMonth()];
  const yyyy = d.getFullYear();

  return `${dd} ${monthName} ${yyyy}`;
};

export const formatDate = (date?: Date) => {
  if (!date) return "";
  return new Date(date).toLocaleDateString("id-ID"); // dd/MM/yyyy
};

export const parseDate = (value: string) => {
  const parts = value.split("/");
  if (parts.length !== 3) return undefined;

  const [day, month, year] = parts.map(Number);
  if (!day || !month || !year) return undefined;

  const date = new Date(year, month - 1, day);
  return isNaN(date.getTime()) ? undefined : date;
};