import io
import json
import xml.etree.ElementTree as ET
from typing import Any

import pandas as pd
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph


def _flatten_record(record: dict[str, Any]) -> dict[str, Any]:
    """Flatten a weather query record to scalar fields for tabular exports."""
    weather = record.get("weather_data", {})
    daily = weather.get("daily", {})
    # Summarize the weather data: take first day's values if available
    dates = daily.get("date", [])
    temp_max = daily.get("temperature_2m_max", [])
    temp_min = daily.get("temperature_2m_min", [])
    precip = daily.get("precipitation_sum", [])

    return {
        "id": record.get("id"),
        "location": record.get("location"),
        "resolved_location": record.get("resolved_location"),
        "latitude": record.get("latitude"),
        "longitude": record.get("longitude"),
        "start_date": str(record.get("start_date", "")),
        "end_date": str(record.get("end_date", "")),
        "date_range": f"{dates[0] if dates else ''} — {dates[-1] if dates else ''}",
        "temp_max_f": temp_max[0] if temp_max else None,
        "temp_min_f": temp_min[0] if temp_min else None,
        "precipitation_mm": precip[0] if precip else None,
        "created_at": str(record.get("created_at", "")),
        "updated_at": str(record.get("updated_at", "")),
    }


def to_json(records: list[dict]) -> tuple[bytes, str]:
    content = json.dumps(records, indent=2, default=str)
    return content.encode("utf-8"), "application/json"


def to_csv(records: list[dict]) -> tuple[bytes, str]:
    flat = [_flatten_record(r) for r in records]
    df = pd.DataFrame(flat)
    buffer = io.StringIO()
    df.to_csv(buffer, index=False)
    return buffer.getvalue().encode("utf-8"), "text/csv"


def to_xml(records: list[dict]) -> tuple[bytes, str]:
    root = ET.Element("weather_queries")
    for record in records:
        flat = _flatten_record(record)
        item = ET.SubElement(root, "query")
        for key, value in flat.items():
            child = ET.SubElement(item, key)
            child.text = str(value) if value is not None else ""
    tree = ET.ElementTree(root)
    buffer = io.BytesIO()
    tree.write(buffer, encoding="utf-8", xml_declaration=True)
    return buffer.getvalue(), "application/xml"


def to_pdf(records: list[dict]) -> tuple[bytes, str]:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, topMargin=0.5 * inch)
    styles = getSampleStyleSheet()
    elements = []

    elements.append(Paragraph("Weather Queries Export", styles["Title"]))
    elements.append(Paragraph(f"Total records: {len(records)}", styles["Normal"]))

    headers = ["ID", "Location", "Start Date", "End Date", "Temp Max (°F)", "Temp Min (°F)", "Created At"]
    table_data = [headers]

    for record in records:
        flat = _flatten_record(record)
        table_data.append([
            str(flat["id"]),
            str(flat["resolved_location"] or flat["location"]),
            str(flat["start_date"]),
            str(flat["end_date"]),
            str(flat["temp_max_f"] or "N/A"),
            str(flat["temp_min_f"] or "N/A"),
            str(flat["created_at"])[:19],
        ])

    col_widths = [0.5 * inch, 2.5 * inch, 1 * inch, 1 * inch, 1 * inch, 1 * inch, 1.5 * inch]
    table = Table(table_data, colWidths=col_widths, repeatRows=1)
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1a73e8")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 8),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f5f5f5")]),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 4),
        ("RIGHTPADDING", (0, 0), (-1, -1), 4),
    ]))
    elements.append(table)
    doc.build(elements)
    return buffer.getvalue(), "application/pdf"


def to_markdown(records: list[dict]) -> tuple[bytes, str]:
    if not records:
        return b"# Weather Queries\n\n_No records found._\n", "text/markdown"

    lines = ["# Weather Queries Export\n"]
    lines.append(f"Total records: {len(records)}\n")
    lines.append("| ID | Location | Start Date | End Date | Temp Max (°F) | Temp Min (°F) | Created At |")
    lines.append("|---|---|---|---|---|---|---|")

    for record in records:
        flat = _flatten_record(record)
        lines.append(
            f"| {flat['id']} "
            f"| {flat['resolved_location'] or flat['location']} "
            f"| {flat['start_date']} "
            f"| {flat['end_date']} "
            f"| {flat['temp_max_f'] or 'N/A'} "
            f"| {flat['temp_min_f'] or 'N/A'} "
            f"| {str(flat['created_at'])[:19]} |"
        )

    return "\n".join(lines).encode("utf-8"), "text/markdown"
