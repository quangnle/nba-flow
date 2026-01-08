# NBA Flow Diagram - Node Standards (ISO 5807)

Tiêu chuẩn quốc tế ISO 5807:1985 cho các ký hiệu flowchart.

## Node Types

| `node_type` | Shape | Use |
|-------------|-------|-----|
| `terminator` | Oval/Rounded Rectangle | Start/End points |
| `process` | Rectangle | Actions, calculations |
| `decision` | Diamond | Branching (if/else, require) |
| `data` | Parallelogram | Input/Output data |
| `predefined_process` | Double-sided Rectangle | External contract calls |
| `document` | Wavy-bottom Rectangle | Events emitted |
| `storage` | Cylinder | State read/write |

## Link Styles

| `line_style` | Use |
|--------------|-----|
| `solid` | Normal flow |
| `dashed` | Token transfer |
| `dotted` | State read |

## Link Types

| `link_type` | Description |
|-------------|-------------|
| `flow` | Normal execution flow |
| `function_call` | External function call |
| `token_transfer` | ERC20 transfer |
| `state_write` | Storage write |
| `state_read` | Storage read |
| `conditional_true` | True branch |
| `conditional_false` | False branch |

## JSON Schema

```json
{
  "metadata": {
    "method": "methodName",
    "function_selector": "0x..."
  },
  "nodes": [
    {
      "id": "unique_id",
      "node_name": "Display Name",
      "node_type": "terminator|process|decision|data|predefined_process|document|storage",
      "description": "Optional details",
      "x": 400,
      "y": 50,
      "addresses": []
    }
  ],
  "links": [
    {
      "from": "node_id",
      "to": "node_id",
      "link_type": "flow|function_call|token_transfer|state_write|state_read|conditional_true|conditional_false",
      "line_style": "solid|dashed|dotted",
      "description": "Optional label"
    }
  ]
}
```
