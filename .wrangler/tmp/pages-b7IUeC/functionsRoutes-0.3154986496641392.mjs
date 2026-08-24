import { onRequestPost as __api_lead_ts_onRequestPost } from "/home/rahmatulloh/projects/asaka/new-project/functions/api/lead.ts"
import { onRequest as __api_lead_ts_onRequest } from "/home/rahmatulloh/projects/asaka/new-project/functions/api/lead.ts"

export const routes = [
    {
      routePath: "/api/lead",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_lead_ts_onRequestPost],
    },
  {
      routePath: "/api/lead",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_lead_ts_onRequest],
    },
  ]