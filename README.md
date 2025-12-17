# NBA Flow Diagram

Ứng dụng visualization diagram với D3.js, Tailwind CSS và Node.js.

## Cài đặt

```bash
npm install
```

## Chạy ứng dụng

```bash
npm start
```

Sau đó mở trình duyệt tại: http://localhost:3000

## Tính năng

- **Diagram Visualization**: Hiển thị nodes và links với D3.js
- **Manual Positioning**: Kéo thả nodes để thay đổi vị trí, vị trí được lưu tự động
- **Info Panel**: Panel bên phải hiển thị thông tin chi tiết của node/link khi click
- **Collapsible Panel**: Info panel có thể thu gọn/mở rộng
- **Address Table**: Hiển thị bảng addresses với scroll (tối đa 15 dòng), có nút detail để xem pairs
- **CRUD Operations**: Tab CRUD để thêm/sửa/xóa nodes và links

## Cấu trúc dự án

```
nba-flow/
├── server.js              # Node.js server
├── diagram.json          # Dữ liệu diagram
├── package.json          # Dependencies
└── public/
    ├── index.html        # HTML chính
    └── js/
        ├── main.js       # Entry point
        ├── diagram.js    # Diagram visualization logic
        ├── infoPanel.js  # Info panel logic
        └── crudPanel.js  # CRUD operations logic
```

## Cấu trúc dữ liệu

### Node
```json
{
  "node_name": "string",
  "node_type": "address" | "contract",
  "addresses": [
    {
      "address": "string",
      "pairs": [
        {
          "name": "string",
          "inAmount": "string",
          "outAmount": "string"
        }
      ]
    }
  ],
  "x": number,
  "y": number
}
```

### Link
```json
{
  "name": "fromNode_toNode",
  "from": "string",
  "to": "string",
  "description": "string"
}
```

