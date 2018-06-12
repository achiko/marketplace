import { Selection, Parcel } from '.'
import { buildCoordinate, COLORS, getColor } from '../../parcel'

export class Map {
  static draw({
    ctx,
    width,
    height,
    size,
    pan,
    nw,
    se,
    center,
    parcels,
    publications,
    selected
  }) {
    ctx.fillStyle = COLORS.background
    ctx.fillRect(0, 0, width, height)

    const selection = []
    const isSelected = (x, y) =>
      selected.some(coords => coords.x === x && coords.y === y)

    const cx = width / 2
    const cy = height / 2
    for (let px = nw.x; px < se.x; px++) {
      for (let py = se.y; py < nw.y; py++) {
        const offsetX = (center.x - px) * size + (pan ? pan.x : 0)
        const offsetY = (py - center.y) * size + (pan ? pan.y : 0)
        const rx = cx - offsetX
        const ry = cy - offsetY
        const id = buildCoordinate(px, py)
        const color = getColor(id, px, py, parcels, publications)
        const parcel = parcels[id]

        const connectedLeft = parcel ? parcel.connectedLeft : false
        const connectedTop = parcel ? parcel.connectedTop : false
        const connectedTopLeft = parcel ? parcel.connectedTopLeft : false

        if (isSelected(px, py)) {
          selection.push({ x: rx, y: ry })
        }
        Parcel.draw({
          ctx,
          x: rx + size / 2,
          y: ry + size / 2,
          size,
          padding: size < 7 ? 0.5 : size < 12 ? 1 : size < 18 ? 1.5 : 2,
          color,
          connectedLeft,
          connectedTop,
          connectedTopLeft
        })
      }
    }
    if (selection.length > 0) {
      Selection.draw({
        ctx,
        selection,
        size
      })
    }
  }
}