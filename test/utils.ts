export function getToday() {
    const dt = new Date();
    const month = dt.getMonth() + 1;
    const date = dt.getDate();
    return `${dt.getFullYear()}-${month.toString().padStart(2, '0')}-${date.toString().padStart(2, '0')}`;
}