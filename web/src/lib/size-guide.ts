/** Body measurements in cm (brand doc §9.2: body measurements, not just S/M/L). */
export const sizeChart = [
  { size: "XS", bust: 81, waist: 64, hip: 89, uk: "6", us: "2" },
  { size: "S", bust: 86, waist: 69, hip: 94, uk: "8", us: "4" },
  { size: "M", bust: 91, waist: 74, hip: 99, uk: "10", us: "6" },
  { size: "L", bust: 97, waist: 80, hip: 105, uk: "12", us: "8" },
  { size: "XL", bust: 103, waist: 86, hip: 111, uk: "14", us: "10" },
  { size: "XXL", bust: 110, waist: 93, hip: 118, uk: "16", us: "12" },
] as const;

export const toInches = (cm: number) => (cm / 2.54).toFixed(1);
