import { exec } from "child_process";

class UrlOpener {
  public open(url: string) {
    const command =
      process.platform === "darwin" // macOS
        ? `open "${url}"`
        : process.platform === "win32" // Windows
          ? `start "" "${url}"`
          : `xdg-open "${url}"`; // Linux

    exec(command, (err) => {
      if (err) {
        console.error(`Error opening URL : ${err.message}`);
        return;
      }
      console.log("Opened URL " + url);
    });
  }
}

const urlOpener = new UrlOpener();

export default urlOpener;
