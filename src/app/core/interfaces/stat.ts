// 假設您的統計數據結構，新增 'icon' 屬性
interface Stat {
    label: string;
    value: string;
    change: string; // 可以是百分比或金額
    icon: string; // PrimeIcons class name (e.g., 'pi pi-chart-line')
    color: string; // 用於不同圖標顏色
}