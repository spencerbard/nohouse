/*
* This file was generated by a tool.
* Rerun sql-ts to regenerate this file.
*/
export interface LinesHistoryRowRead {
"uid": string 
"event_key": string 
"sport_key": string 
"home_team": string 
"away_team": string 
"event_start_time": any 
"h2h_home": any | null 
"h2h_away": any | null 
"h2h_draw": any | null 
"spread_home": any | null 
"spread_away": any | null 
"spread_home_vig": any | null 
"spread_away_vig": any | null 
"total": any | null 
"total_over_vig": any | null 
"total_under_vig": any | null 
"load_uid": string 
"created_at": any 
}
export interface OddsHistoryRowRead {
"uid": string 
"event_key": string 
"sport_key": string 
"sport_nice": string 
"commence_time": number 
"home_team": string 
"away_team": string 
"teams": any 
"sites": any 
"sites_count": number 
"created_at": any 
"load_uid": string 
"market": string 
}
export interface SportsRowRead {
"key": string 
"active": boolean 
"group": string 
"details": string 
"title": string 
"has_outrights": boolean 
"created_at": any 
}
export interface UserLinesRowRead {
"uid": string 
"line_uid": string 
"amount": number 
"creator_uid": string 
"created_at": any 
"creator_side": line_market_side 
"acceptor_uid": string | null 
"accepted_at": any | null 
"acceptor_side": line_market_side | null 
"deleted_at": any | null 
}
export interface UsersRowRead {
"uid": string 
"name": string 
"email": string 
"password": string 
"created_at": any 
"updated_at": any 
"deleted_at": any | null 
}
export interface LinesHistoryRowWrite {
"uid"?: string 
"event_key": string 
"sport_key": string 
"home_team": string 
"away_team": string 
"event_start_time": any 
"h2h_home"?: any | null
"h2h_away"?: any | null
"h2h_draw"?: any | null
"spread_home"?: any | null
"spread_away"?: any | null
"spread_home_vig"?: any | null
"spread_away_vig"?: any | null
"total"?: any | null
"total_over_vig"?: any | null
"total_under_vig"?: any | null
"load_uid": string 
"created_at"?: any 
}
export interface OddsHistoryRowWrite {
"uid"?: string 
"event_key": string 
"sport_key": string 
"sport_nice": string 
"commence_time": number 
"home_team": string 
"away_team": string 
"teams": any 
"sites": any 
"sites_count": number 
"created_at"?: any 
"load_uid": string 
"market": string 
}
export interface SportsRowWrite {
"key": string 
"active": boolean 
"group": string 
"details": string 
"title": string 
"has_outrights": boolean 
"created_at"?: any 
}
export interface UserLinesRowWrite {
"uid"?: string 
"line_uid": string 
"amount": number 
"creator_uid": string 
"created_at"?: any 
"creator_side": line_market_side 
"acceptor_uid"?: string | null
"accepted_at"?: any | null
"acceptor_side"?: line_market_side | null
"deleted_at"?: any | null
}
export interface UsersRowWrite {
"uid"?: string 
"name": string 
"email": string 
"password": string 
"created_at"?: any 
"updated_at"?: any 
"deleted_at"?: any | null
}
export enum line_market_side {
spread_home = "spread_home",
spread_away = "spread_away",
total_over = "total_over",
total_under = "total_under",
h2h_home = "h2h_home",
h2h_away = "h2h_away",
}
