const PREFIX = "AAU/HSE-M";
const NUMBER_LENGTH = 3;
const ID_SEPARATOR = "/";

type LastMaintenence = { record_number: string } | null;

export function generateMaintenenceId(last: LastMaintenence): string {
  const now = new Date();
  const year = now.getFullYear();
  const monthRoman = toRoman(now.getMonth() + 1);

  let nextNumber = 1;

  if (last?.record_number) {
    const parts = last.record_number.split(ID_SEPARATOR);

    // expected: [number, AAU, HSE-M, month, year]
    if (parts.length === 5 && parts[4] === String(year)) {
      const parsedNumber = Number(parts[0]);
      if (Number.isInteger(parsedNumber)) {
        nextNumber = parsedNumber + 1;
      }
    }
  }

  const formattedNumber = String(nextNumber).padStart(NUMBER_LENGTH, "0");

  return `${formattedNumber}/${PREFIX}/${monthRoman}/${year}`;
}

function toRoman(month: number): string {
  const romans = [
    "I", "II", "III", "IV", "V", "VI",
    "VII", "VIII", "IX", "X", "XI", "XII",
  ];

  return romans[month - 1];
}
