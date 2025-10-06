import * as fs from "fs";

/**
 * SGF metadata extracted from a file
 */
export interface SgfMetadata {
  date?: string;
  event?: string;
  round?: string;
  blackPlayer?: string;
  whitePlayer?: string;
  blackRank?: string;
  whiteRank?: string;
  komi?: string;
  result?: string;
  blackWins: boolean;
  whiteWins: boolean;
}

/**
 * Fast SGF parser that only reads the beginning of files
 * to extract metadata properties. Optimized for performance.
 */
export class SgfParser {
  // Only read first 1KB of file - metadata is always at the start
  private static readonly MAX_BYTES_TO_READ = 1024;

  /**
   * Parses SGF file and extracts metadata
   * @param filePath - Absolute path to SGF file
   * @returns Parsed metadata or null if parsing fails
   */
  public static parseFile(filePath: string): SgfMetadata | null {
    try {
      // Read only the first chunk of the file for performance
      const buffer = Buffer.alloc(this.MAX_BYTES_TO_READ);
      const fd = fs.openSync(filePath, "r");
      const bytesRead = fs.readSync(fd, buffer, 0, this.MAX_BYTES_TO_READ, 0);
      fs.closeSync(fd);

      const content = buffer.toString("utf8", 0, bytesRead);

      // Validate it's an SGF file (starts with "(;")
      if (!content.trim().startsWith("(;")) {
        return null;
      }

      return this.parseMetadata(content);
    } catch (error) {
      // If file can't be read or parsed, return null
      return null;
    }
  }

  /**
   * Parses SGF content string to extract metadata
   * @param content - SGF file content (header portion)
   * @returns Parsed metadata
   */
  private static parseMetadata(content: string): SgfMetadata {
    const metadata: SgfMetadata = {
      blackWins: false,
      whiteWins: false,
    };

    // Extract properties using regex
    // SGF format: PROP[value] where value can contain anything except ]
    metadata.date = this.extractProperty(content, "DT");
    metadata.event = this.extractProperty(content, "EV");
    metadata.round = this.extractProperty(content, "RO");
    metadata.blackPlayer = this.extractProperty(content, "PB");
    metadata.whitePlayer = this.extractProperty(content, "PW");
    metadata.blackRank = this.extractProperty(content, "BR");
    metadata.whiteRank = this.extractProperty(content, "WR");
    metadata.komi = this.extractProperty(content, "KM");
    metadata.result = this.extractProperty(content, "RE");

    // Parse result to determine winner
    if (metadata.result) {
      const resultUpper = metadata.result.toUpperCase();
      if (resultUpper.startsWith("B+")) {
        metadata.blackWins = true;
      } else if (resultUpper.startsWith("W+")) {
        metadata.whiteWins = true;
      }
    }

    return metadata;
  }

  /**
   * Extracts a property value from SGF content
   * @param content - SGF content
   * @param property - Property name (e.g., "DT", "PB")
   * @returns Property value or undefined
   */
  private static extractProperty(
    content: string,
    property: string,
  ): string | undefined {
    // Match PROP[value] - handle escaped brackets and multi-line values
    const regex = new RegExp(`${property}\\[([^\\]]*?)\\]`, "i");
    const match = content.match(regex);
    return match ? match[1].trim() : undefined;
  }
}
