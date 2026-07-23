export const convertDateToTimeStampString = (value: Date) => {
  return `${
    value.getFullYear()
}-${
    String(value.getMonth() + 1).padStart(2, '0')
}-${
    String(value.getDate()).padStart(2, '0')
} ${
    String(value.getHours()).padStart(2, '0')
}:${
    String(value.getMinutes()).padStart(2, '0')
}:${
    String(value.getSeconds()).padStart(2, '0')
}`
}