// Rasterise an SVG to a PNG at an exact pixel size using AppKit (macOS 11+).
// Usage: swift scripts/render-svg.swift <in.svg> <width> <height> <out.png>
import AppKit

let args = CommandLine.arguments
guard args.count == 5, let width = Int(args[2]), let height = Int(args[3]) else {
  FileHandle.standardError.write("usage: render-svg.swift <in.svg> <width> <height> <out.png>\n".data(using: .utf8)!)
  exit(2)
}
guard let image = NSImage(contentsOfFile: args[1]) else {
  FileHandle.standardError.write("cannot read \(args[1])\n".data(using: .utf8)!)
  exit(1)
}
let rep = NSBitmapImageRep(
  bitmapDataPlanes: nil, pixelsWide: width, pixelsHigh: height, bitsPerSample: 8,
  samplesPerPixel: 4, hasAlpha: true, isPlanar: false, colorSpaceName: .deviceRGB,
  bytesPerRow: 0, bitsPerPixel: 0)!
rep.size = NSSize(width: width, height: height)
NSGraphicsContext.saveGraphicsState()
NSGraphicsContext.current = NSGraphicsContext(bitmapImageRep: rep)
NSGraphicsContext.current?.imageInterpolation = .high
image.draw(in: NSRect(x: 0, y: 0, width: width, height: height), from: .zero, operation: .copy, fraction: 1)
NSGraphicsContext.restoreGraphicsState()
let png = rep.representation(using: .png, properties: [:])!
try! png.write(to: URL(fileURLWithPath: args[4]))
