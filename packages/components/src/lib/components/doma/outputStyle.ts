// 00	Normal
// 01	Sign right
// 02	Scale-preserving
// 03	Scientific
// 04	Scientific with leading zero
// 05	Scale-preserving scientific
// 06	Engineering

// generate enum
export enum OutputStyle {
  NORMAL = '00',
  SIGN_RIGHT = '01',
  SCALE_PRESERVING = '02',
  SCIENTIFIC = '03',
  SCIENTIFIC_WITH_LEADING_ZERO = '04',
  SCALE_PRESERVING_SCIENTIFIC = '05',
  ENGINEERING = '06',
}
