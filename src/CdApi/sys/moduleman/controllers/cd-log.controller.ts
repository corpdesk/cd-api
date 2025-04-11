import { BaseService } from "../../base/base.service";
import { CdLogService } from "../services/cd-log.service";

export class CdLogController {
  b: BaseService;
  svCdLog: CdLogService;

  constructor() {
    this.b = new BaseService();
    this.svCdLog = new CdLogService();
    this.svCdLog.init();
  }

  /**
   * {
          "ctx": "Sys",
          "m": "Moduleman",
          "c": "CdLog",
          "a": "Get",
          "dat": {
              "f_vals": [
                  {
                      "query": {
                          "where": {"phrase": "CdRequest::processPost()","since": {"unit": "min", "value": "20"}}
                      }
                  }
              ],
              "token": "08f45393-c10e-4edd-af2c-bae1746247a1"
          },
          "args": null
      }
   * @param req
   * @param res
   */
  // async Get(req, res) {
  //   try {
  //       // const reader = new CdLogReader("/path/to/logs"); // e.g., /home/devops/cd-api/
  //     await this.svCdLog.init();
  //   //   await this.svCdLog.getCdLog(req, res);

  //     const logsWithPhrase = await this.svCdLog.queryLogs({
  //       phrase: "CdRequest::processPost()",
  //       since: new Date(Date.now() - 20 * 60 * 1000), // last 20 minutes
  //     });

  //     const recentLogs = await this.svCdLog.queryLogs({
  //       since: new Date(Date.now() - 20 * 60 * 1000),
  //     });

  //     console.log("Logs with phrase:", JSON.stringify(logsWithPhrase, null, 2));
  //     console.log("Recent logs:", JSON.stringify(recentLogs, null, 2));
  //   } catch (e) {
  //     await this.b.serviceErr(req, res, e, "CdLogController:Get");
  //   }
  // }
  async Get(req, res) {
    try {
      await this.svCdLog.getCdLog(req, res);
    } catch (e) {
      await this.b.serviceErr(req, res, e, "CdLogController:Get");
    }
  }
}
