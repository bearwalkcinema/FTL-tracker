import React, { useState, useEffect, useMemo } from "react";
import { supabase } from "../lib/supabaseClient";
import {
  Film, MapPin, Users, Calendar, CheckCircle2, Circle, Clock,
  ChevronRight, ChevronLeft, X, Plus, Home as HomeIcon, Camera,
  PlayCircle, FileText, AlertCircle, Compass, Layers, Video, Sparkles, HardDrive, Sun, Moon, Pencil, ChevronDown, Search
} from "lucide-react";

// ---------- Domain constants ----------
const DISCOVERY_ITEMS = ["Initial research","Champion research","Organization research","Themes identified","Supplementary voices identified","Archive opportunities identified","Discovery conversations completed","Initial story direction established"];
const PREPROD_ITEMS = ["Interview subjects identified","Interviews confirmed","Locations confirmed","Production dates confirmed","Travel planned","Crew confirmed","Equipment planned","Releases prepared","Interview questions prepared","Production schedule completed"];
const PRODUCTION_ITEMS = ["Primary interview","Supplementary voice interviews","Observational filming","B-roll","Archive capture","Additional production","Pickup filming"];
const POSTPROD_ITEMS = ["Media backed up","Footage organized","Transcripts completed","Interview selects completed","Story map / paper edit","Assembly","Rough cut","Internal review","Client review","Fine cut","Picture lock","Color","Sound design","Music","Graphics","Captions","Final master"];

const PHASES = [
  { key: "discovery", label: "Discovery", items: DISCOVERY_ITEMS },
  { key: "preProduction", label: "Pre-Production", items: PREPROD_ITEMS },
  { key: "production", label: "Production", items: PRODUCTION_ITEMS },
  { key: "postProduction", label: "Post-Production", items: POSTPROD_ITEMS },
];
const STATUS_OPTIONS = ["Not Started", "In Progress", "Complete", "Not Needed"];
const STATUS_VALUE = { "Not Started": 0, "In Progress": 0.5, "Complete": 1, "Not Needed": null };
const STATUS_COLOR = { "Not Started": "#B9B0A0", "In Progress": "#C9922B", "Complete": "#6B7A5E", "Not Needed": "#D8D2C4" };

const INK = "#241F1A";
const CREAM = "#F8F4EC";
const CREAM_2 = "#F1EBDD";
const LINE = "#E3DBC9";
const GOLD = "#C9922B";
const CLAY = "#A15139";
const SAGE = "#6B7A5E";
const MUTE = "#8A8272";
const LOGO_SRC = "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48c3ZnIGlkPSJMYXllcl8yIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1OTAuNDk0MiAxMDQuMDQ1NSI+PGcgaWQ9IkNvbXBvbmVudHMiPjxnIGlkPSJfOWZkODA0ZDMtZTRmYy00ZjI3LTg0ZWMtODc0NjhmYmEzZDkzXzEiPjxwYXRoIGQ9Ik0yNi4wMTMyLDgxLjkzMmMxLjQwMDYtNy4xNTcxLDQuMjk1My0xMS44NDYsMTEuOTYzLTEzLjE5OTMtMS40NDgsNi4yNDU1LTYuMDE1OCwxMS4wNDg0LTExLjc1MTMsMTMuMzk2Ni0uMDcwNS0uMDY1OC0uMTQxMS0uMTMxNS0uMjExNi0uMTk3M1oiLz48cGF0aCBkPSJNODIuOTMxMyw4Mi4xMTg5bC01LjUyMDUtMy4zNjNjLTMuMjczMy0yLjYwMjUtNS40OTg2LTYuMDgyNS02LjE5NjMtMTAuMjEyN2wzLjExNjYsMS4wODMyYzMuMTY2NSwxLjEwMDUsNS45OTkyLDMuMzEzLDcuMDM2OCw2LjU1NjZsMS44MjY3LDUuNzEwOC4xMzU2LjE1OTJjLS4wOTQ1LjA4NjktLjE4OS4xNzM5LS4yODM1LjI2MDhsLS4xMTU0LS4xOTQ5WiIvPjxwYXRoIGQ9Ik04Mi44NTg5LDIxLjc4NjNjLTEuNDUwMyw3LjA4NzgtNC4yMTgxLDExLjM1NjktMTEuNTgzNywxMy4wNzc5Ljc2OTQtNS45NjkzLDUuNTgxNy0xMC40OTk2LDExLjQwOTgtMTMuMjg5My4wNTc5LjA3MDUuMTE1OS4xNDA5LjE3MzguMjExNFoiLz48cGF0aCBkPSJNMjYuMDcxMywyMS42NzM5Yy4wNjk0LS4wOTI4LjEzODktLjE4NTUuMjA4My0uMjc4M2wuMTUxNS4yNjY3YzUuNDU0OCwyLjM5MTQsMTAuMjYyOCw2Ljc2NDksMTEuNDc0NSwxMy4xMzEtNy40NTUxLTEuNTQzNy0xMC4xMjc4LTYuMDA5MS0xMS41ODgtMTIuNzkyM2wtLjI0NjItLjMyNzFaIi8+PHBhdGggZD0iTTguNTUxOSw1OS40OTFjLTIuMTA0MS0zLjUxNzktNC43ODk2LTYuMTI3NS04LjU1MTktNy45MDM3LDMuNjA0OS0xLjY4NDUsNi4zNTg2LTQuMzI4NSw4LjUxNDMtOC4wMzI2LDIuMzY1MSwzLjU5ODEsNS40MzUsNi4xMjg0LDkuNDk1OSw3Ljk2NC0zLjg5OTksMS44MDctNy4xMzA1LDQuMzYzLTkuNDU4NCw3Ljk3MjNaIi8+PHBhdGggZD0iTTEwMC41MjAxLDU5LjQ4OTRjLTIuNDA2OS0zLjYzNTItNS41NjY0LTYuMjcyMS05LjQyNjEtNy45MDk0LDMuOTQyNS0xLjg1NjksNy4wNzU1LTQuMzc2NSw5LjQxODItNy45NjgsMi4xMzMzLDMuNTEyNCw0Ljc0NDksNi4xNjY2LDguNTEzOSw3Ljk1MzQtMy41MTAzLDEuNzI1OS02LjI3MTksNC4xODYtOC41MDU5LDcuOTI0WiIvPjxwYXRoIGQ9Ik01NC41NDA5LDEwNC4wNDU1Yy0xLjgyMDgtMy4zNDM4LTQuMDM3OS01LjcxNjItNy4yNzI2LTcuNjM3NywzLjcyODItMi4xMzQ0LDUuNzY3Ny01LjI2NTYsNy4yOTEyLTkuMzAwMiwxLjQzMDYsNC4wMTc5LDMuNTU2OCw3LjE0NTUsNy4yODI4LDkuMjgzMy0zLjMwOTMsMS45MTkyLTUuNTc3Myw0LjM1MDgtNy4zMDE0LDcuNjU0NloiLz48cGF0aCBkPSJNNTQuNTgxMywxNy4wNDg1Yy0xLjQzNy00LjA2MzItMy40NzE3LTcuMTQ1OC03LjI0ODMtOS4zNDM0LDMuMzMzNS0xLjg3MDMsNS40NDYtNC41MzA0LDcuMjkxMy03LjcwNTEsMS43MDg5LDMuNDY4NSw0LjA1OTksNi4wMDYxLDcuMjMzNSw3LjY2OTktMy42NDUsMi4xNDU0LTYuMDg4Myw1LjIzNzMtNy4yNzY1LDkuMzc4N1oiLz48cG9seWdvbiBwb2ludHM9IjM5LjIzNTQgNTEuNTM0MSA0NC40NzA3IDUzLjQzODQgNDkuNzUyIDUxLjg1MyA0NC41MjE1IDQ5Ljg4MzIgMzkuMjM1NCA1MS41MzQxIi8+PHBvbHlnb24gcG9pbnRzPSI1Ni41ODAxIDQyLjEwMSA1NC43MjU2IDM2LjYzNDcgNTIuODk5OSA0MS44NjQ3IDU0LjYzNjMgNDcuODUxNSA1Ni41ODAxIDQyLjEwMSIvPjxwb2x5Z29uIHBvaW50cz0iNTQuNjU5MiA2Ny41MTMxIDU2LjUxNjEgNjIuMDIgNTQuNjM1OCA1Ni4wMTIxIDUyLjg4MzggNjIuMDI3OCA1NC42NTkyIDY3LjUxMzEiLz48cGF0aCBkPSJNODQuODY1Nyw1MS41MTI2YzUuMjQyNy0yLjYxNzcsOS41MjczLTYuMTE1NywxMi4zNjEzLTEwLjkxNDEuNzQyNy0xLjI1NjguNzg4Ni0yLjU1ODEtLjQ3MDctMy40NDI0LTEuODgxMy0xLjMyMTgtNC4wMTMyLTIuMTYxMS02LjI5LTIuNzYwNy02LjkwNDgtMS44MTc0LTEzLjk5MzItLjgxOTgtMTkuODQ5MSwzLjI4ODZsLTguMzA0Miw1LjgyNjIsNi4xMDYtOC4wMzc2YzQuOTQ3OC02LjUxMjcsNS4wNTA4LTE4LjM3NTUtLjAzMjItMjUuMDQ5My0uNTk0Ny0uNzkxNS0xLjc2NzEtMS4xOTE5LTIuNjg5OS0uNjg1MS01LjA1MDgsMi43NzM5LTguNjg0Niw3LjA3ODYtMTAuOTgxLDEyLjQ2MDQtMi4zNDY3LTUuMjI0MS01LjgyMzctOS40ODczLTEwLjU3MTgtMTIuMjU4My0xLjMzMDEtLjc3NjQtMi40MzA3LS40MDgyLTMuMzE1OS43OTMtNC43NDA3LDYuNDI5Mi00Ljg5NTUsMTcuNjYyNi0uMDE4MSwyNC40NjQ4bDYuMDI5OCw3Ljk5MjctOC43MTkyLTUuOTgyOWMtMTAuNzQ3MS03LjM3NDUtMjYuMTQxNi0xLjgzODQtMjYuNTA1OSwxLjQ5MzItLjA1MzIuNDg2OC4zMjg2LDEuNTYyNS42Mjc5LDIuMDYxLDIuOTAzOCw0LjgyODEsNy4yNTA1LDguMjE5NywxMi40NTQ2LDEwLjc5OTgtNC44ODA5LDIuMzAxOC05LjI0NDEsNS42NTU4LTEyLjIzMzQsMTAuMjkzOS0uNjYxNiwxLjAyNjktLjkyNjgsMi4xOTA0LS42MDMsMy4yODY2LDYuMjA3LDUuMjE0NCwxOC44NDI4LDUuODI0NywyNS4wNjAxLDEuNjU2N2wxMC4xMzMzLTYuNzkzLTUuMjU3Myw2Ljc4NDdjLTMuODkxNiw1LjAyMi01LjMwMjcsMTEuMTMwNC00LjMxODgsMTcuNDI3Ny41ODg0LDMuNzY2MSwxLjY5ODcsNy4xNzI0LDQuNDE1NSwxMC4wMjM5Ljk0ODcuMTI2NSwyLjA0NzktLjE1MzMsMi45MzY1LS43MTM5LDQuMzgyOC0yLjc2NTYsNy41MzkxLTYuNzQ0Niw5Ljg5Ni0xMS41NDg4LDIuMjg2Niw1LjEwNjQsNS44OTI2LDkuMzE4OCwxMC42NzA0LDExLjk5NjEsMS4yMTA0LjY3ODcsMi40ODU0LjM0MzMsMy4wOTM4LS44NjQzLDIuNTU3MS0zLjQ5OSwzLjQ5MTItNy42OTYzLDMuNjc0OC0xMi4yNDEyLjIyMjctNS41MTg2LTEuNTk0Mi0xMC4xODE2LTQuNzY1Ni0xNC4zMjA4bC01LjE4NTUtNi43Njc2LDcuNjM3Miw1LjM3ODljMS45NDI0LDEuMzY3Nyw0LjExNDMsMi42MDI1LDYuNDQzNCwzLjMwOTEsNi4yNDA3LDEuODk0LDEyLjg0NzIsMS4yNDE3LDE4LjcwMzEtMS40OTU2LDEuMjU0NC0uNTg2NCwyLjEyNTUtMS41OTc3LDIuOTYtMi43Ny0yLjM5MzYtNi4wMTE3LTcuNTk3Mi05LjY2NTUtMTMuMDkxOC0xMi42OTE5Wk00NC42NDIxLDM0Ljc1NThjLTEuNzY5LTIuNjI0LTMuMjY1Ni01LjUyNjQtMy4xMTk2LTguNjcxNC4xNzE0LTMuNjk4MiwzLjQzNTUtNi4wMzEyLDYuOTQ1My01LjE5NTgsMi43MTY4LjY0NjUsNC42NjAyLDIuNDIzOCw2LjA5NzIsNS4wMjkzLDIuNjgxMi00Ljc2MjIsNy44NTg0LTYuNjY3NSwxMS4yMTgzLTMuOTc3MSwzLjMzMDEsMi42NjY1LDIuMDE3Niw4LjUwODgtMS4wNjU5LDEyLjUyNjQtNC4yMjk1LDUuNTEwMy03LjQzNTEsMTEuMDIyNS0xMC4wMjIsMTcuNDU3bC00LjI5NzktOC42MzA5LTUuNzU1NC04LjUzNzZaTTQ2LjU3NjcsNTUuMDU2MWMtNC43NTYzLDEuNzY5NS04Ljk2MTQsOC44MjgxLTE2LjMzMiw5LjU5NTctMi4wOTgxLjIxODgtNC4xMzY3LS4zNTE2LTUuNDEwNi0xLjY4OC0xLjM4ODctMS40NTctMS44MjYyLTMuNDM2NS0xLjQyODItNS41NTE4LjQ4NzgtMi41OTI4LDIuMzAzMi00LjQ1NTYsNC43ODYxLTUuODc4OS0yLjIwNjEtMS41MjY5LTQuMTE3Mi0zLjMzNS00LjcxOTItNS45NzQxLS40ODY4LTIuMTM0OC0uMjEzOS00LjIwNywxLjM4ODItNS43NjgxLDMuODk4NC0zLjc5ODMsMTAuOTMxMi0uMDI3MywxNS4yODM3LDQuMTE0NywyLjk4MjQsMi44Mzg0LDYuMTkzOCw0Ljg4NDMsOS45OTEyLDYuNDk4bDQuMTc1OCwxLjc3NDktNy43MzQ5LDIuODc3NFpNNjQuNDM0MSw2OC42NTQyYzIuMDA5OCwyLjYxNTIsMy4yMzEsNS41NDEsMy40MTYsOC44MDIyLS4xNjcsMS44NDUyLS43NzEsMy41NDk4LTIuMDMxNyw0LjYzOTYtMS4zMjk2LDEuMTQ5NC0zLjI3NzgsMS41MDQ0LTUuMTE2MiwxLjE0NDUtMi42NDg0LS43MDctNC40MjY4LTIuMjcwNS02LjA3MTMtNC45OTU2LTIuNjAxMSw0LjUyOTMtNy41MTI3LDYuNTgwMS0xMC44ODYyLDQuMTcyOS0zLjY1NjItMi42MDk0LTIuNjQ2NS04LjYxNjIuNDY3My0xMi44Mzc5LDMuOTYxNC01LjM3MDEsNy4yODIyLTEwLjc2ODYsMTAuMzY4Mi0xNy4xOTM4LDIuOTIzOCw2LjAxMzIsNS45Nzc1LDExLjIyNDYsOS44NTQsMTYuMjY4MVpNODQuNTU5Niw2Mi44NjUyYy0zLjUxMDcsMy43NDgtOS43MzA1LDEuMjY3MS0xNC4yMTM5LTIuMjQ5bC01LjgwNjYtNC41NTMyYy0yLjczNTgtMi4xNDU1LTYuMjA4LTIuNjMwOS05LjY3NzItMy44NzY1bDQuNDIzMy0xLjg1OTljNC4wMzQ3LTEuNjk3Myw3LjMzOTQtNC4wODg0LDEwLjUwODgtNy4wNDY5LDQuMjk5OC00LjAxMzIsMTEuMjQwMi03LjA4NTQsMTQuODYzOC0zLjI0NjEsMi45NzI3LDMuMTUwNC45NDY4LDguODQ2Mi0zLjYyMzUsMTEuNDYxNCwyLjUwMjQsMS4zOTExLDQuNDk0MSwzLjQyNzIsNC45MzYsNi4zNTM1LjI4MTcsMS44NjQzLS4yMjIyLDMuNzQ3Ni0xLjQxMDYsNS4wMTY2WiIvPjxwYXRoIGQ9Ik01OS4yODU3LDUxLjg2ODZsNS44Njc3LDEuNTA0OSw0LjkyMjktMS43NzM5Yy0xLjg2MzgtLjc0NDEtMy42Nzc3LTEuMzU0NS01LjIxNTMtMS41ODk0bC01LjU3NTIsMS44NTg0WiIvPjxwYXRoIGQ9Ik0xNDkuOTY1NSw2OS41MTRoLTQuNzUxczAtMzQuNzU2NSwwLTM0Ljc1NjVoMjMuNDg0NXMwLDQuNzUwOSwwLDQuNzUwOWgtMTguNzMzNXYzMC4wMDU2Wk0xNDkuNDkzOSw0OS43NjAxaDE3LjE2MTR2NC43NTExcy0xNy4xNjE0LDAtMTcuMTYxNCwwdi00Ljc1MTFaIi8+PHBhdGggZD0iTTE5OS45MjE0LDY5LjkxMDhjLTIuNTMyNywwLTQuODgyMS0uNDQ3LTcuMDU2Ny0xLjM0MS0yLjE2NTktLjg5NC00LjA0MzYtMi4xNDM4LTUuNjMzMS0zLjc0OTMtMS41ODA4LTEuNjA1NS0yLjgyMDktMy40ODAyLTMuNzAzLTUuNjMzMS0uODkwOC0yLjE1MjktMS4zMzYyLTQuNTAxOS0xLjMzNjItNy4wNTE2LDAtMi41NDk3LjQ0NTQtNC44OTg4LDEuMzM2Mi03LjA1MTYuODgyMS0yLjE0ODMsMi4xMjIyLTQuMDI3NiwzLjcwMy01LjYzMzEsMS41ODk1LTEuNjA1NiwzLjQ1ODUtMi44NTUzLDUuNjE1Ny0zLjc0OTMsMi4xNDg1LS44OTQsNC41MTUyLTEuMzQxLDcuMDc0Mi0xLjM0MSwyLjU0MTUsMCw0Ljg4MjEuNDQyNCw3LjAzOTIsMS4zMTgyLDIuMTU3Mi44NzU4LDQuMDI2MiwyLjExNjQsNS42MDY5LDMuNzIyLDEuNTg5NSwxLjYwNTUsMi44MTIyLDMuNDkzOSwzLjY4NTYsNS42NjA1Ljg3MzQsMi4xNjY2LDEuMzEsNC41MjQ3LDEuMzEsNy4wNzQ1LDAsMi41ODE3LS40MzY3LDQuOTQ4OS0xLjMxLDcuMTAxOC0uODczNCwyLjE0ODMtMi4wOTYsNC4wMjc2LTMuNjg1Niw1LjYzMzEtMS41ODA4LDEuNjA1Ni0zLjQ0OTcsMi44NDYyLTUuNjA2OSwzLjcyMi0yLjE1NzIuODgwMy00LjQ5NzgsMS4zMTgyLTcuMDM5MiwxLjMxODJaTTE5OS44Nzc3LDY1LjQ5MWMxLjg2OSwwLDMuNTg5NS0uMzI4NCw1LjE2MTUtLjk5NDMsMS41NjMzLS42NjE0LDIuOTI1Ny0xLjU5NjQsNC4wODczLTIuODA1MiwxLjE1MjgtMS4yMDQyLDIuMDUyNC0yLjYyMjcsMi43MDc0LTQuMjQxOS42NDYzLTEuNjIzOC45Njk0LTMuMzkzNS45Njk0LTUuMzEzOCwwLTEuOTIwMy0uMzIzMS0zLjY4MDktLjk2OTQtNS4yODY1LS42NTUtMS42MDU1LTEuNTU0Ni0zLjAxOTUtMi43MDc0LTQuMjQ2NS0xLjE2MTYtMS4yMjI0LTIuNTI0LTIuMTY2Ni00LjA4NzMtMi44MjgtMS41NzItLjY2MTQtMy4yOTI1LS45OTQzLTUuMTYxNS0uOTk0My0xLjgzNCwwLTMuNTM3MS4zMzMtNS4xMDkxLjk5NDMtMS41NzIuNjYxNC0yLjk0MzIsMS42MDU2LTQuMTEzNSwyLjgyOC0xLjE3MDMsMS4yMjctMi4wNzg2LDIuNjQwOS0yLjczMzYsNC4yNDY1LS42NDYzLDEuNjA1Ni0uOTY5NCwzLjM2NjItLjk2OTQsNS4yODY1LDAsMS45MjAzLjMyMzEsMy42OS45Njk0LDUuMzEzOC42NTUsMS42MTkyLDEuNTYzMywzLjAzNzgsMi43MzM2LDQuMjQxOSwxLjE3MDMsMS4yMDg3LDIuNTQxNSwyLjE0MzgsNC4xMTM1LDIuODA1MSwxLjU3Mi42NjU5LDMuMjc1MS45OTQzLDUuMTA5MS45OTQzWiIvPjxwYXRoIGQ9Ik0yMzEuMzQwMyw2OS41MTR2LTM0Ljc1NjVzMTIuOTY5MywwLDEyLjk2OTMsMGMyLjkxNywwLDUuNDA2MS40ODM1LDcuNDY3MiwxLjQ0MTMsMi4wNjExLjk2MjQsMy42NDE5LDIuMzQ5LDQuNzUxMSw0LjE2OSwxLjEwOTIsMS44MjQ1LDEuNjY4MSwzLjk5MTEsMS42NjgxLDYuNTA0MywwLDIuNTE3OC0uNTU4OSw0LjY3NTMtMS42NjgxLDYuNDgxNS0xLjEwOTIsMS44MDE3LTIuNjg5OSwzLjE4MzctNC43NTEsNC4xNDYyLTIuMDYxMS45NTc5LTQuNTUwMiwxLjQzNjgtNy40NjcyLDEuNDM2OGgtMTAuMzU4czIuMTM5Ny0yLjI4MDYsMi4xMzk3LTIuMjgwNnYxMi44NTgxcy00Ljc1MSwwLTQuNzUxLDBaTTIzNi4wOTE0LDU3LjE0ODVsLTIuMTM5Ny0yLjQzMTFoMTAuMjE4MmMzLjAzOTMsMCw1LjM0NDktLjY4NDIsNi45MTctMi4wNjE3LDEuNTcyLTEuMzcyOSwyLjM0OTMtMy4yOTc4LDIuMzQ5My01Ljc4MzYsMC0yLjQ4MTMtLjc3NzMtNC40MDE2LTIuMzQ5My01Ljc1NjMtMS41NzItMS4zNTkyLTMuODc3Ny0yLjAzODktNi45MTctMi4wMzg5aC0xMC4yMTgyczIuMTM5Ny0yLjQ4MTMsMi4xMzk3LTIuNDgxM3YyMC41NTI5Wk0yNTMuNTg0Nyw2OS41MTRsLTguNDYyOC0xMi42MTE4aDUuMDgyOXM4LjU1ODksMTIuNjExOCw4LjU1ODksMTIuNjExOGgtNS4xNzlaIi8+PHBhdGggZD0iTTMwNi4zMDA0LDY5LjUxMzl2LTMwLjAwNTVoLTExLjQwNnYtNC43NTFzMjcuNTE5NCwwLDI3LjUxOTQsMHY0Ljc1MXMtMTEuNDE0NywwLTExLjQxNDcsMHYzMC4wMDU1cy00LjY5ODYsMC00LjY5ODYsMFoiLz48cGF0aCBkPSJNMzQwLjU2MzUsNjkuNTE0aC00Ljc1MXYtMzQuNzU2NXM0Ljc1MSwwLDQuNzUxLDB2MzQuNzU2NVpNMzYwLjEwMDUsNTQuNTE4MWgtMjAuMDA4NnMwLTQuNzU4LDAtNC43NThoMjAuMDA4NnY0Ljc1OFpNMzU5LjY3MjUsMzQuNzU3NGg0Ljc1OTh2MzQuNzU2NXMtNC43NTk4LDAtNC43NTk4LDB2LTM0Ljc1NjVaIi8+PHBhdGggZD0iTTM4Mi45NTAzLDY0Ljc2MjhsMTkuMzg4NS0uMDAxNXY0Ljc1MjVzLTI0LjEzOTUsMC0yNC4xMzk1LDB2LTM0Ljc1NjVzMjQuMTM5NSwwLDI0LjEzOTUsMHY0Ljc1MWgtMTkuMzg4NXYyNS4yNTQ0Wk0zODIuNTIyMyw0OS43NTQ3aDE3LjEwOXMwLDQuNzU2NSwwLDQuNzU2NWgtMTcuMTA5di00Ljc1NjVaIi8+PHBhdGggZD0iTTQzNy44NDA2LDY5LjUxMzl2LTM0Ljc1NjVzNC43NTEsMCw0Ljc1MSwwdjMwLjAwNTVoMTguMDE3M3Y0Ljc1MXMtMjIuNzY4NCwwLTIyLjc2ODQsMFoiLz48cGF0aCBkPSJNNDkxLjU5OTksNjkuOTEwNmMtMi41MzI3LDAtNC44OTA4LS40NDctNy4wNTY3LTEuMzQxLTIuMTc0Ny0uODk0LTQuMDUyNC0yLjE0MzgtNS42MzMxLTMuNzQ5My0xLjU4OTUtMS42MDU1LTIuODIwOS0zLjQ4MDItMy43MTE4LTUuNjMzMS0uODgyMS0yLjE1MjktMS4zMjc1LTQuNTAxOS0xLjMyNzUtNy4wNTE2LDAtMi41NDk3LjQ0NTQtNC44OTg4LDEuMzI3NS03LjA1MTYuODkwOC0yLjE0ODMsMi4xMjIyLTQuMDI3NiwzLjcxMTgtNS42MzMxLDEuNTgwOC0xLjYwNTYsMy40NDk3LTIuODU1Myw1LjYwNjktMy43NDkzLDIuMTU3Mi0uODk0LDQuNTE1Mi0xLjM0MSw3LjA4MjktMS4zNDEsMi41MzI3LDAsNC44ODIxLjQ0MjQsNy4wMzA1LDEuMzE4MiwyLjE1NzIuODc1OCw0LjAyNjIsMi4xMTY0LDUuNjE1NywzLjcyMiwxLjU4MDgsMS42MDU1LDIuODEyMiwzLjQ5MzksMy42NzY4LDUuNjYwNS44NzM0LDIuMTY2NiwxLjMxLDQuNTI0NywxLjMxLDcuMDc0NSwwLDIuNTgxNy0uNDM2Nyw0Ljk0ODktMS4zMSw3LjEwMTgtLjg2NDYsMi4xNDgzLTIuMDk2LDQuMDI3Ni0zLjY3NjgsNS42MzMxLTEuNTg5NSwxLjYwNTYtMy40NTg1LDIuODQ2Mi01LjYxNTcsMy43MjItMi4xNDg1Ljg4MDMtNC40OTc4LDEuMzE4Mi03LjAzMDUsMS4zMTgyWk00OTEuNTU2Miw2NS40OTA4YzEuODY5LDAsMy41ODA4LS4zMjg0LDUuMTUyOC0uOTk0MywxLjU3Mi0uNjYxNCwyLjkzNDUtMS41OTY0LDQuMDg3My0yLjgwNTIsMS4xNTI4LTEuMjA0MiwyLjA2MTEtMi42MjI3LDIuNzA3NC00LjI0MTkuNjU1LTEuNjIzOC45NzgyLTMuMzkzNS45NzgyLTUuMzEzOCwwLTEuOTIwMy0uMzIzMS0zLjY4MDktLjk3ODItNS4yODY1LS42NDYzLTEuNjA1NS0xLjU1NDYtMy4wMTk1LTIuNzA3NC00LjI0NjUtMS4xNTI4LTEuMjIyNC0yLjUxNTMtMi4xNjY2LTQuMDg3My0yLjgyOC0xLjU3Mi0uNjYxNC0zLjI4MzgtLjk5NDMtNS4xNTI4LS45OTQzLTEuODQyOCwwLTMuNTQ1OC4zMzMtNS4xMTc5Ljk5NDMtMS41NjMzLjY2MTQtMi45MzQ1LDEuNjA1Ni00LjEwNDgsMi44MjgtMS4xNzksMS4yMjctMi4wODczLDIuNjQwOS0yLjczMzYsNC4yNDY1LS42NTUsMS42MDU2LS45NzgyLDMuMzY2Mi0uOTc4Miw1LjI4NjUsMCwxLjkyMDMuMzIzMSwzLjY5Ljk3ODIsNS4zMTM4LjY0NjMsMS42MTkyLDEuNTU0NiwzLjAzNzgsMi43MzM2LDQuMjQxOSwxLjE3MDMsMS4yMDg3LDIuNTQxNSwyLjE0MzgsNC4xMDQ4LDIuODA1MSwxLjU3Mi42NjU5LDMuMjc1MS45OTQzLDUuMTE3OS45OTQzWiIvPjxwYXRoIGQ9Ik01MzIuNjE3LDY5LjUxMzhsLTE0LjY0NjItMzQuNzU2NWg1LjEzNTNzMTMuNDQ5NywzMi4wNzQ1LDEzLjQ0OTcsMzIuMDc0NWgtMi45NDMyczEzLjU0NTctMzIuMDc0NSwxMy41NDU3LTMyLjA3NDVoNC43NTFzLTE0LjU5MzcsMzQuNzU2NS0xNC41OTM3LDM0Ljc1NjVoLTQuNjk4NloiLz48cGF0aCBkPSJNNTcxLjEwNTcsNjQuNzYyN2wxOS4zODg1LS4wMDE1djQuNzUyNXMtMjQuMTM5NSwwLTI0LjEzOTUsMHYtMzQuNzU2NXMyNC4xMzk1LDAsMjQuMTM5NSwwdjQuNzUxaC0xOS4zODg1djI1LjI1NDRaTTU3MC42Nzc4LDQ5Ljc1NDZoMTcuMTA5czAsNC43NTY1LDAsNC43NTY1aC0xNy4xMDl2LTQuNzU2NVoiLz48L2c+PC9nPjwvc3ZnPg==";

function uid(p) { return p + "_" + Math.random().toString(36).slice(2, 9); }
const BROKEN_IMG = "data:image/svg+xml;utf8," + encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='260'><rect width='100%' height='100%' fill='#E3DBC9'/><text x='50%' y='46%' font-family='monospace' font-size='13' fill='#8A8272' text-anchor='middle'>Image link didn't load</text><text x='50%' y='58%' font-family='monospace' font-size='11' fill='#8A8272' text-anchor='middle'>check sharing permissions / URL format</text></svg>`
);
function handleImgError(e) { e.target.onerror = null; e.target.src = BROKEN_IMG; }

function resizeImageFile(file, maxDim = 1400, quality = 0.85) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) { height = Math.round(height * (maxDim / width)); width = maxDim; }
          else { width = Math.round(width * (maxDim / height)); height = maxDim; }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width; canvas.height = height;
        canvas.getContext("2d").drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const CHAMPION_ACCENTS = ["#004829","#547272","#CDA67F","#793F0F","#E3AF1B","#EE5023","","#542D4C","#65907F",""];

function makeEpisode(n) {
  const phases = {};
  PHASES.forEach((p) => { phases[p.key] = {}; p.items.forEach((i) => (phases[p.key][i] = "Not Started")); });
  return {
    id: uid("ep"), number: n, title: `Episode ${n}`, champion: "", producer1: "Brian Tortora", producer2: "Daniela Goncalves", editor: "Daniel Latimer",
    director: "", execProducer1: "Brian Tortora", execProducer2: "Daniela Goncalves",
    phaseOverride: "Auto", activePhases: n === 1 ? ["Production", "Post-Production"] : [], accentColor: CHAMPION_ACCENTS[n - 1] || "", coverImageUrl: "", dataSizeTB: "", hoursFootage: "",
    priority: "Medium", targetDate: "", statusSummary: "Not yet started.", nextMilestone: "Kick off discovery.",
    phases,
  };
}

function initialData() {
  return {
    seriesTitle: "For the Love",
    galleryUrl: "",
    seriesLogline: "A documentary series that shows how love, when lived and acted upon, can become a transformative force in the world.",
    episodes: Array.from({ length: 10 }, (_, i) => makeEpisode(i + 1)),
    interviews: [],
    productionDays: [],
    milestones: [],
  };
}

function phasePercent(phaseObj, items) {
  const vals = items.map((n) => STATUS_VALUE[phaseObj[n] ?? "Not Started"]).filter((v) => v !== null);
  if (vals.length === 0) return 100;
  return Math.round((100 * vals.reduce((a, b) => a + b, 0)) / vals.length);
}
function episodePhasePercents(ep) {
  const out = {};
  PHASES.forEach((p) => (out[p.key] = phasePercent(ep.phases[p.key], p.items)));
  return out;
}
function episodeCompletion(ep) {
  const pcts = episodePhasePercents(ep);
  return Math.round(PHASES.reduce((a, p) => a + pcts[p.key], 0) / PHASES.length);
}
function currentPhaseLabels(ep) {
  if (ep.activePhases && ep.activePhases.length > 0) return ep.activePhases;
  const pcts = episodePhasePercents(ep);
  for (const p of PHASES) if (pcts[p.key] < 100) return [p.label];
  return ["Complete"];
}

function StyleSheet() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500&display=swap');
      .ftlo * { box-sizing: border-box; }
      .ftlo { font-family: 'Inter', sans-serif; color: ${INK}; }
      .ftlo .serif { font-family: 'Fraunces', serif; }
      .ftlo .mono { font-family: 'IBM Plex Mono', monospace; letter-spacing: 0.02em; }
      .ftlo .sprocket { display:flex; gap:3px; height:14px; }
      .ftlo .sprocket span { flex:1; border-radius:2px; background:${LINE}; }
      .ftlo ::-webkit-scrollbar { width:8px; height:8px; }
      .ftlo ::-webkit-scrollbar-thumb { background:${LINE}; border-radius:4px; }
      .ftlo .card-hover:hover { transform: translateY(-7px) scale(1.015) rotate(-0.4deg); box-shadow: 0 22px 40px -16px rgba(36,31,26,0.32), 0 0 0 1px var(--accent, ${LINE}), 0 0 18px -4px var(--accent, transparent); }
      .ftlo .card-hover { transition: transform .45s cubic-bezier(.34,1.56,.64,1), box-shadow .45s cubic-bezier(.34,1.56,.64,1); }
      .ftlo .container { --bg: ${CREAM}; --bg2: ${CREAM_2}; --surface: #ffffff; --ink: ${INK}; --mute: ${MUTE}; --line: ${LINE}; max-width: 1440px; margin: 0 auto; background: var(--bg); color: var(--ink); transition: background .3s ease, color .3s ease; }
      .ftlo .container.dark { --bg: #17140F; --bg2: #201C15; --surface: #221E17; --ink: #F1EAE0; --mute: #A79B87; --line: #3A342A; }
      .ftlo .container.dark img { filter: brightness(0.92); }
      .ftlo .container.dark .card-hover { background: var(--surface) !important; }
      .ftlo .producer-shell { display: flex; min-height: calc(100vh - 44px); }
      .ftlo .producer-sidebar { width: 170px; flex-shrink: 0; }
      @media (max-width: 720px) {
        .ftlo .producer-shell { flex-direction: column; }
        .ftlo .producer-sidebar { width: 100%; display: flex; overflow-x: auto; border-right: none !important; border-bottom: 1px solid ${LINE}; padding-top: 0 !important; }
        .ftlo .producer-sidebar button { white-space: nowrap; border-bottom: none !important; }
      }
      @media (max-width: 480px) {
        .ftlo .topbar-label { display: none; }
        .ftlo .topbar { padding: 8px 12px !important; }
        .ftlo .view-switch button { padding: 5px 9px !important; font-size: 11px !important; }
      }
      @media (max-width: 640px) {
        .ftlo .episodes-header { flex-direction: column; align-items: center; text-align: center; }
        .ftlo .episodes-header-right { flex-direction: column; width: 100%; align-items: center; }
        .ftlo .phase-legend { justify-content: center; flex-wrap: wrap; row-gap: 6px; }
        .ftlo .mode-toggle { width: 100%; max-width: 260px; }
        .ftlo .mode-toggle button { flex: 1; }
      }
      .ftlo .card-hover:active { transform: translateY(-3px) scale(0.99) rotate(0deg); transition: transform .1s ease; }
      @keyframes galleryShift { 0% { background-position: 0% 50%; } 100% { background-position: 100% 50%; } }
      @keyframes sparkleSpin { 0%, 100% { transform: rotate(0deg) scale(1); } 50% { transform: rotate(14deg) scale(1.15); } }
      .ftlo .gallery-btn {
        background: linear-gradient(100deg, #547272, #E3AF1B, #EE5023, #004829, #547272);
        background-size: 300% 100%;
        animation: galleryShift 5s ease infinite alternate;
        transition: transform .4s cubic-bezier(.34,1.56,.64,1), box-shadow .4s ease;
        box-shadow: 0 6px 16px -6px rgba(36,31,26,0.35);
      }
      .ftlo .gallery-btn:hover { transform: scale(1.06) rotate(-1deg); box-shadow: 0 10px 22px -6px rgba(36,31,26,0.45); }
      .ftlo .gallery-btn:hover .gallery-icon { animation: sparkleSpin .6s ease infinite; }
      .ftlo .card-hover svg { transition: transform .45s cubic-bezier(.34,1.56,.64,1); }
      .ftlo .card-hover:hover svg { transform: scale(1.08); }
      .ftlo button { font-family: inherit; cursor:pointer; }
      .ftlo input, .ftlo select, .ftlo textarea { font-family: 'Inter', sans-serif; }
    `}</style>
  );
}

const PHASE_COLORS = { discovery: "#547272", preProduction: "#E3AF1B", production: "#EE5023", postProduction: "#004829" };

function SegmentBar({ pcts, height = 10 }) {
  return (
    <div className="sprocket" style={{ height }}>
      {PHASES.map((p) => (
        <span key={p.key} style={{ background: `linear-gradient(90deg, ${PHASE_COLORS[p.key]} ${pcts[p.key]}%, var(--line, ${LINE}) ${pcts[p.key]}%)` }} title={`${p.label}: ${pcts[p.key]}%`} />
      ))}
    </div>
  );
}

function Ring({ pct, size = 92, stroke = 9, label, sub, accent = GOLD }) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r;
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={size/2} cy={size/2} r={r} stroke="var(--line, #E3DBC9)" strokeWidth={stroke} fill="none" />
        <circle cx={size/2} cy={size/2} r={r} stroke={accent} strokeWidth={stroke} fill="none"
          strokeDasharray={c} strokeDashoffset={c - (pct/100)*c} strokeLinecap="round"
          transform={`rotate(-90 ${size/2} ${size/2})`} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span className="serif" style={{ fontSize: size * 0.24, fontWeight: 600, lineHeight: 1, color: "var(--ink, #241F1A)" }}>{pct}%</span>
        {sub && <span className="mono" style={{ fontSize: 9, color: "var(--mute, #8A8272)", marginTop: 2 }}>{sub}</span>}
      </div>
    </div>
  );
}

function StatBlock({ value, label, icon: Icon }) {
  return (
    <div style={{ padding: "16px 18px", background: "var(--surface, #fff)", border: "1px solid var(--line, #E3DBC9)", borderRadius: 12, minWidth: 140 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, color: GOLD }}>
        {Icon && <Icon size={15} />}
        <span className="mono" style={{ fontSize: 10, color: "var(--mute, #8A8272)", textTransform: "uppercase" }}>{label}</span>
      </div>
      <div className="serif" style={{ fontSize: 26, fontWeight: 600, color: "var(--ink, #241F1A)" }}>{value}</div>
    </div>
  );
}

function StatusPill({ status }) {
  return (
    <span className="mono" style={{ fontSize: 10, padding: "3px 8px", borderRadius: 20, background: STATUS_COLOR[status] + "22", color: STATUS_COLOR[status], border: `1px solid ${STATUS_COLOR[status]}55`, whiteSpace: "nowrap" }}>
      {status}
    </span>
  );
}

function episodeStats(ep, data) {
  const days = data.productionDays.filter((d) => d.episodeId === ep.id);
  return {
    interviews: data.interviews.filter((i) => i.episodeId === ep.id).length,
    supp: data.interviews.filter((i) => i.episodeId === ep.id && i.type === "Supplementary Voice").length,
    days: days.length,
    cities: new Set(days.map((d) => d.city).filter(Boolean)).size,
    states: new Set(days.map((d) => d.state).filter(Boolean)).size,
    countries: new Set(days.map((d) => d.country).filter(Boolean)).size,
    hours: Number(ep.hoursFootage) || 0,
  };
}

function EpisodeDataTable({ data, openEpisode }) {
  const [sortKey, setSortKey] = useState("number");
  const [sortDir, setSortDir] = useState("asc");
  const columns = [
    { key: "number", label: "Ep" }, { key: "title", label: "Title" }, { key: "champion", label: "Champion" },
    { key: "phase", label: "Phase(s)" }, { key: "completion", label: "Complete %" },
    { key: "discovery", label: "Discovery %" }, { key: "preProduction", label: "Pre-Prod %" },
    { key: "production", label: "Production %" }, { key: "postProduction", label: "Post-Prod %" },
    { key: "interviews", label: "Interviews" }, { key: "supp", label: "Supp. Voices" }, { key: "days", label: "Prod. Days" },
    { key: "cities", label: "Cities" }, { key: "countries", label: "Countries" }, { key: "hours", label: "Hours" },
  ];
  const rows = data.episodes.map((ep) => {
    const pcts = episodePhasePercents(ep);
    const s = episodeStats(ep, data);
    return { id: ep.id, number: ep.number, title: ep.title, champion: ep.champion || "—", phase: currentPhaseLabels(ep).join(" + "),
      completion: episodeCompletion(ep), ...pcts, ...s, accent: ep.accentColor || GOLD };
  });
  const sorted = [...rows].sort((a, b) => {
    let av = a[sortKey], bv = b[sortKey];
    if (typeof av === "string") { av = av.toLowerCase(); bv = bv.toLowerCase(); }
    if (av < bv) return sortDir === "asc" ? -1 : 1;
    if (av > bv) return sortDir === "asc" ? 1 : -1;
    return 0;
  });
  const toggleSort = (key) => { if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc")); else { setSortKey(key); setSortDir("asc"); } };
  const cell = { padding: "8px 12px", borderBottom: "1px solid var(--line, #E3DBC9)" };

  return (
    <div style={{ overflowX: "auto", border: "1px solid var(--line, #E3DBC9)", borderRadius: 12 }}>
      <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 12.5 }}>
        <thead>
          <tr style={{ background: "var(--bg2, #F1EBDD)" }}>
            {columns.map((c) => (
              <th key={c.key} onClick={() => toggleSort(c.key)} className="mono" style={{ textAlign: "left", padding: "9px 12px", fontSize: 10, color: "var(--mute, #8A8272)", textTransform: "uppercase", cursor: "pointer", whiteSpace: "nowrap", borderBottom: "1px solid var(--line, #E3DBC9)", userSelect: "none" }}>
                {c.label}{sortKey === c.key ? (sortDir === "asc" ? " \u25B2" : " \u25BC") : ""}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((r, idx) => (
            <tr key={r.id} onClick={() => openEpisode(r.id)} style={{ cursor: "pointer", background: idx % 2 ? "var(--surface, #fff)" : "var(--bg2, #FCFAF5)" }}>
              <td style={cell}><span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 2, background: r.accent, marginRight: 6 }} />{String(r.number).padStart(2, "0")}</td>
              <td style={{ ...cell, fontWeight: 600 }}>{r.title}</td>
              <td style={{ ...cell, color: "var(--mute, #8A8272)" }}>{r.champion}</td>
              <td style={cell} className="mono">{r.phase}</td>
              <td style={cell} className="mono">{r.completion}%</td>
              <td style={cell} className="mono">{r.discovery}%</td>
              <td style={cell} className="mono">{r.preProduction}%</td>
              <td style={cell} className="mono">{r.production}%</td>
              <td style={cell} className="mono">{r.postProduction}%</td>
              <td style={cell} className="mono">{r.interviews}</td>
              <td style={cell} className="mono">{r.supp}</td>
              <td style={cell} className="mono">{r.days}</td>
              <td style={cell} className="mono">{r.cities}</td>
              <td style={cell} className="mono">{r.countries}</td>
              <td style={cell} className="mono">{r.hours}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ---------- Client-facing views ----------
function ClientOverview({ data, openEpisode }) {
  const [mode, setMode] = useState("overview");
  const [progressOpen, setProgressOpen] = useState(false);
  const episodes = data.episodes;
  const seriesPct = Math.round(episodes.reduce((a, e) => a + episodeCompletion(e), 0) / episodes.length);
  const seriesPhaseAvg = {};
  PHASES.forEach((p) => { seriesPhaseAvg[p.key] = Math.round(episodes.reduce((a, e) => a + episodePhasePercents(e)[p.key], 0) / episodes.length); });

  const totalInterviews = data.interviews.length;
  const totalSupp = data.interviews.filter((i) => i.type === "Supplementary Voice").length;
  const totalDays = data.productionDays.length;
  const cities = new Set(data.productionDays.map((d) => d.city).filter(Boolean));
  const states = new Set(data.productionDays.map((d) => d.state).filter(Boolean));
  const countries = new Set(data.productionDays.map((d) => d.country).filter(Boolean));
  const hours = data.episodes.reduce((a, e) => a + (Number(e.hoursFootage) || 0), 0);
  const dataTB = data.episodes.reduce((a, e) => a + (Number(e.dataSizeTB) || 0), 0).toFixed(1);

  const byCountry = {};
  data.productionDays.forEach((d) => {
    if (!d.country) return;
    byCountry[d.country] = byCountry[d.country] || new Set();
    if (d.city) byCountry[d.country].add(d.city);
  });

  const today = new Date();
  const msDay = 24 * 60 * 60 * 1000;
  const parseDate = (s) => { if (!s) return null; const d = new Date(s + "T00:00:00"); return isNaN(d) ? null : d; };
  const last30 = data.milestones.filter((m) => { const d = parseDate(m.date); return d && (today - d) >= 0 && (today - d) <= 30 * msDay; }).sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  const next30 = data.milestones.filter((m) => { const d = parseDate(m.date); return d && (d - today) > 0 && (d - today) <= 30 * msDay; }).sort((a, b) => (a.date || "").localeCompare(b.date || ""));

  return (
    <div>
      {/* Hero */}
      <div style={{ padding: "clamp(32px,6vw,56px) clamp(20px,5vw,40px) clamp(24px,4vw,40px)", background: "radial-gradient(ellipse at top left, var(--bg2, #F1EBDD), var(--bg, #F8F4EC))", borderBottom: "1px solid var(--line, #E3DBC9)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: GOLD }}>
            <Film size={16} /><span className="mono" style={{ fontSize: 11, textTransform: "uppercase" }}>Documentary Series &middot; 10 Episodes</span>
          </div>
          {data.galleryUrl && (
            <a href={data.galleryUrl} target="_blank" rel="noreferrer" className="gallery-btn" style={{ display: "flex", alignItems: "center", gap: 7, color: "#fff", borderRadius: 20, padding: "8px 18px", fontSize: 12.5, fontWeight: 600, textDecoration: "none" }}>
              <Camera size={14} className="gallery-icon" /> View Photo Gallery <Sparkles size={12} className="gallery-icon" />
            </a>
          )}
        </div>
        <img src={LOGO_SRC} alt={data.seriesTitle} style={{ height: "clamp(32px,6vw,48px)", width: "auto", display: "block" }} />
        {data.seriesLogline && <p className="serif" style={{ color: "var(--ink, #241F1A)", marginTop: 14, fontSize: 19, fontStyle: "italic", maxWidth: 620, lineHeight: 1.4 }}>{data.seriesLogline}</p>}
        <p className="mono" style={{ color: "var(--mute, #8A8272)", marginTop: 10, fontSize: 11.5, maxWidth: 560, textTransform: "uppercase" }}>Where the series stands today &mdash; from first conversation to final master.</p>

        <div style={{ display: "flex", gap: 28, alignItems: "center", marginTop: 32, flexWrap: "wrap" }}>
          <Ring pct={seriesPct} size={120} stroke={11} sub="series complete" />
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {PHASES.map((p) => (
              <div key={p.key} style={{ background: "var(--surface, #fff)", border: "1px solid var(--line, #E3DBC9)", borderTop: `3px solid ${PHASE_COLORS[p.key]}`, borderRadius: 10, padding: "10px 14px", textAlign: "center", minWidth: 96 }}>
                <div className="serif" style={{ fontSize: 22, fontWeight: 600 }}>{seriesPhaseAvg[p.key]}%</div>
                <div className="mono" style={{ fontSize: 9, color: "var(--mute, #8A8272)", textTransform: "uppercase" }}>{p.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Series stats */}
      <div style={{ padding: "28px 40px", display: "flex", gap: 12, flexWrap: "wrap" }}>
        <StatBlock value={totalInterviews} label="Interviews" icon={Users} />
        <StatBlock value={totalSupp} label="Supplementary Voices" icon={Users} />
        <StatBlock value={totalDays} label="Production Days" icon={Calendar} />
        <StatBlock value={cities.size} label="Cities" icon={MapPin} />
        <StatBlock value={countries.size} label="Countries" icon={Compass} />
        <StatBlock value={hours} label="Hours of Footage" icon={Video} />
        <StatBlock value={`${dataTB} TB`} label="Data Captured" icon={HardDrive} />
      </div>

      {/* Episode cards */}
      <div style={{ padding: "8px 40px 40px" }}>
        <div className="episodes-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 10, marginBottom: 4 }}>
          <h2 className="serif" style={{ fontSize: 22, margin: 0 }}>Episodes</h2>
          <div className="episodes-header-right" style={{ display: "flex", gap: 16, alignItems: "center" }}>
            {mode === "overview" && (
              <div className="phase-legend" style={{ display: "flex", gap: 14, alignItems: "center" }}>
                {PHASES.map((p) => (
                  <div key={p.key} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <span style={{ width: 8, height: 8, borderRadius: 2, background: PHASE_COLORS[p.key], display: "inline-block" }} />
                    <span className="mono" style={{ fontSize: 9.5, color: "var(--mute, #8A8272)" }}>{p.label}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="mode-toggle" style={{ display: "flex", gap: 3, background: "var(--bg2, #F1EBDD)", borderRadius: 8, padding: 3 }}>
              {["overview", "data"].map((m) => (
                <button key={m} onClick={() => setMode(m)} style={{ padding: "5px 12px", borderRadius: 6, border: "none", fontSize: 11.5, background: mode === m ? "var(--ink, #241F1A)" : "transparent", color: mode === m ? "var(--bg, #F8F4EC)" : "var(--mute, #8A8272)" }}>
                  {m === "overview" ? "Overview" : "Data View"}
                </button>
              ))}
            </div>
          </div>
        </div>
        <p className="mono" style={{ fontSize: 10.5, color: "var(--mute, #8A8272)", fontStyle: "italic", margin: "0 0 16px" }}>Episode titles below are working titles and subject to change.</p>
        {mode === "overview" ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))", gap: 16 }}>
          {episodes.map((ep) => {
            const pcts = episodePhasePercents(ep);
            const comp = episodeCompletion(ep);
            const accent = ep.accentColor || GOLD;
            const epInterviews = data.interviews.filter((i) => i.episodeId === ep.id).length;
            const epDays = data.productionDays.filter((d) => d.episodeId === ep.id).length;
            const epLocs = new Set(data.productionDays.filter((d) => d.episodeId === ep.id).map((d) => d.location)).size;
            return (
              <button key={ep.id} onClick={() => openEpisode(ep.id)} className="card-hover" style={{ "--accent": accent, textAlign: "left", background: "var(--surface, #fff)", border: "1px solid var(--line, #E3DBC9)", borderTop: ep.coverImageUrl ? "1px solid var(--line, #E3DBC9)" : `3px solid ${accent}`, borderRadius: 14, padding: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                {ep.coverImageUrl && <img src={ep.coverImageUrl} alt="" style={{ width: "100%", height: 130, objectFit: "cover" }} onError={handleImgError} />}
                <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <span className="mono" style={{ fontSize: 10, color: accent }}>EP {String(ep.number).padStart(2, "0")}</span>
                    <div className="serif" style={{ fontSize: 18, fontWeight: 600 }}>{ep.title}</div>
                    <div style={{ fontSize: 12.5, color: "var(--mute, #8A8272)", marginTop: 2 }}>{ep.champion || "Primary voice TBD"}</div>
                  </div>
                  <Ring pct={comp} size={54} stroke={6} accent={accent} />
                </div>
                <SegmentBar pcts={pcts} />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5 }} className="mono">
                  <span style={{ color: "var(--mute, #8A8272)" }}>{currentPhaseLabels(ep).join(" + ")}</span>
                </div>
                <div style={{ display: "flex", gap: 14, fontSize: 12, color: "var(--mute, #8A8272)", borderTop: "1px solid var(--line, #E3DBC9)", paddingTop: 10 }}>
                  <span>{epInterviews} interviews</span><span>{epDays} days</span><span>{epLocs} locations</span>
                </div>
                <div style={{ fontSize: 12, color: "var(--ink, #241F1A)", background: "var(--bg2, #F1EBDD)", borderRadius: 8, padding: "6px 10px" }}>
                  Next: {ep.nextMilestone || "TBD"}
                </div>
                </div>
              </button>
            );
          })}
        </div>
        ) : (
          <EpisodeDataTable data={data} openEpisode={openEpisode} />
        )}
      </div>

      {/* Locations */}
      {Object.keys(byCountry).length > 0 && (
        <div style={{ padding: "0 40px 40px" }}>
          <h2 className="serif" style={{ fontSize: 22, marginBottom: 16 }}>Where We've Filmed</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px,1fr))", gap: 14 }}>
            {Object.entries(byCountry).map(([country, citySet]) => (
              <div key={country} style={{ background: "var(--surface, #fff)", border: "1px solid var(--line, #E3DBC9)", borderRadius: 12, padding: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, color: CLAY }}><MapPin size={15} /><span className="serif" style={{ fontWeight: 600 }}>{country}</span></div>
                <div style={{ fontSize: 12.5, color: "var(--mute, #8A8272)", marginTop: 6 }}>{[...citySet].join(", ") || "—"}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Progress */}
      <div style={{ padding: "0 40px 56px" }}>
        <button onClick={() => setProgressOpen((o) => !o)} style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--surface, #fff)", border: "1px solid var(--line, #E3DBC9)", borderRadius: 14, padding: "18px 22px", cursor: "pointer" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Sparkles size={17} color={GOLD} />
            <span className="serif" style={{ fontSize: 19, fontWeight: 600, color: "var(--ink, #241F1A)" }}>Recent Progress</span>
          </div>
          <ChevronDown size={18} color="var(--mute, #8A8272)" style={{ transform: progressOpen ? "rotate(180deg)" : "none", transition: "transform .25s ease" }} />
        </button>
        {progressOpen && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginTop: 16 }}>
            <div>
              <h3 className="mono" style={{ fontSize: 11, color: "var(--mute, #8A8272)", textTransform: "uppercase", marginBottom: 10 }}>Last 30 Days</h3>
              {last30.length === 0 && <p style={{ color: "var(--mute, #8A8272)", fontSize: 13 }}>Nothing logged in the last 30 days.</p>}
              {last30.map((m) => (
                <div key={m.id} style={{ display: "flex", gap: 10, padding: "10px 0", borderBottom: "1px solid var(--line, #E3DBC9)" }}>
                  <span style={{ width: 8, height: 8, borderRadius: 8, background: SAGE, marginTop: 5, flexShrink: 0 }} />
                  <div><div style={{ fontSize: 13.5 }}>{m.text}</div><div className="mono" style={{ fontSize: 10, color: "var(--mute, #8A8272)" }}>{m.date}{m.episodeId && (" · " + (data.episodes.find((e) => e.id === m.episodeId)?.title || ""))}</div></div>
                </div>
              ))}
            </div>
            <div>
              <h3 className="mono" style={{ fontSize: 11, color: "var(--mute, #8A8272)", textTransform: "uppercase", marginBottom: 10 }}>Next 30 Days</h3>
              {next30.length === 0 && <p style={{ color: "var(--mute, #8A8272)", fontSize: 13 }}>Nothing scheduled in the next 30 days.</p>}
              {next30.map((m) => (
                <div key={m.id} style={{ display: "flex", gap: 10, padding: "10px 0", borderBottom: "1px solid var(--line, #E3DBC9)" }}>
                  <span style={{ width: 8, height: 8, borderRadius: 8, background: CLAY, marginTop: 5, flexShrink: 0 }} />
                  <div><div style={{ fontSize: 13.5 }}>{m.text}</div><div className="mono" style={{ fontSize: 10, color: "var(--mute, #8A8272)" }}>{m.date}{m.episodeId && (" · " + (data.episodes.find((e) => e.id === m.episodeId)?.title || ""))}</div></div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ClientEpisode({ data, ep, back }) {
  const pcts = episodePhasePercents(ep);
  const comp = episodeCompletion(ep);
  const accent = ep.accentColor || GOLD;
  const interviews = data.interviews.filter((i) => i.episodeId === ep.id);
  const days = data.productionDays.filter((d) => d.episodeId === ep.id);
  const locSet = new Set(days.map((d) => d.location).filter(Boolean));
  const citySet = new Set(days.map((d) => d.city).filter(Boolean));
  const stateSet = new Set(days.map((d) => d.state).filter(Boolean));
  const countrySet = new Set(days.map((d) => d.country).filter(Boolean));
  const hours = Number(ep.hoursFootage) || 0;
  const supp = interviews.filter((i) => i.type === "Supplementary Voice").length;

  return (
    <div style={{ padding: "32px 40px 56px" }}>
      <button onClick={back} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", color: "var(--mute, #8A8272)", fontSize: 13, marginBottom: 20 }}>
        <ChevronLeft size={16} /> All episodes
      </button>
      {ep.coverImageUrl && <img src={ep.coverImageUrl} alt="" style={{ width: "100%", height: 260, objectFit: "cover", borderRadius: 14, marginBottom: 24, border: "1px solid var(--line, #E3DBC9)" }} onError={handleImgError} />}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 20 }}>
        <div>
          <span className="mono" style={{ fontSize: 11, color: accent }}>EPISODE {String(ep.number).padStart(2, "0")}</span>
          <h1 className="serif" style={{ fontSize: 36, margin: "4px 0 2px" }}>{ep.title}</h1>
          <p className="mono" style={{ fontSize: 10.5, color: "var(--mute, #8A8272)", fontStyle: "italic", margin: "0 0 6px" }}>Working title — subject to change</p>
          <p style={{ color: "var(--mute, #8A8272)", fontSize: 14, marginBottom: 0 }}>{ep.champion || "Primary voice TBD"}</p>
          {(ep.director || ep.execProducer1 || ep.execProducer2) && (
            <p className="mono" style={{ color: "var(--mute, #8A8272)", fontSize: 11, marginTop: 6, letterSpacing: "0.01em" }}>
              {ep.director && <>Directed by {ep.director}</>}
              {ep.director && (ep.execProducer1 || ep.execProducer2) && "  ·  "}
              {(ep.execProducer1 || ep.execProducer2) && <>Executive Produced by {[ep.execProducer1, ep.execProducer2].filter(Boolean).join(" & ")}</>}
            </p>
          )}
        </div>
        <Ring pct={comp} size={100} stroke={10} sub="complete" accent={accent} />
      </div>

      <div style={{ margin: "20px 0", background: "var(--surface, #fff)", border: "1px solid var(--line, #E3DBC9)", borderRadius: 12, padding: 18 }}>
        <div className="mono" style={{ fontSize: 10, color: "var(--mute, #8A8272)", marginBottom: 6 }}>CURRENT STATUS</div>
        <p style={{ margin: 0, fontSize: 14.5 }}>{ep.statusSummary}</p>
        <div className="mono" style={{ fontSize: 10, color: "var(--mute, #8A8272)", marginTop: 14, marginBottom: 6 }}>WHAT'S NEXT</div>
        <p style={{ margin: 0, fontSize: 14.5 }}>{ep.nextMilestone}</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 10, margin: "24px 0" }}>
        {PHASES.map((p) => (
          <div key={p.key} style={{ background: "var(--surface, #fff)", border: "1px solid var(--line, #E3DBC9)", borderRadius: 10, padding: 12 }}>
            <div className="mono" style={{ fontSize: 9.5, color: "var(--mute, #8A8272)", marginBottom: 6 }}>{p.label.toUpperCase()}</div>
            <div className="serif" style={{ fontSize: 20, fontWeight: 600, marginBottom: 6 }}>{pcts[p.key]}%</div>
            <div style={{ height: 5, background: LINE, borderRadius: 3 }}><div style={{ height: 5, width: `${pcts[p.key]}%`, background: PHASE_COLORS[p.key], borderRadius: 3 }} /></div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 30 }}>
        <StatBlock value={interviews.length} label="Interviews" icon={Users} />
        <StatBlock value={supp} label="Supp. Voices" icon={Users} />
        <StatBlock value={days.length} label="Production Days" icon={Calendar} />
        <StatBlock value={locSet.size} label="Locations" icon={MapPin} />
        <StatBlock value={citySet.size} label="Cities" icon={MapPin} />
        <StatBlock value={countrySet.size} label="Countries" icon={Compass} />
        <StatBlock value={hours} label="Hours Footage" icon={Video} />
      </div>

      <h2 className="serif" style={{ fontSize: 20, marginBottom: 12 }}>Interviews</h2>
      {interviews.length === 0 ? <p style={{ color: "var(--mute, #8A8272)", fontSize: 13 }}>No interviews logged yet.</p> : (
        <div style={{ border: "1px solid var(--line, #E3DBC9)", borderRadius: 12, overflow: "hidden", marginBottom: 30 }}>
          {interviews.map((i, idx) => (
            <div key={i.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, padding: "12px 16px", borderTop: idx ? "1px solid var(--line, #E3DBC9)" : "none", background: "var(--surface, #fff)" }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{i.person}</div>
                <div style={{ fontSize: 12, color: "var(--mute, #8A8272)" }}>{i.date || "date TBD"} &middot; {i.location || "location TBD"}</div>
                {i.description && <div style={{ fontSize: 12.5, marginTop: 4, maxWidth: 480 }}>{i.description}</div>}
              </div>
              <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                {i.viewingLink && <a href={i.viewingLink} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: GOLD }}>Watch</a>}
                {i.transcriptLink && <a href={i.transcriptLink} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: GOLD }}>Transcript</a>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------- Producer backend ----------
function ChecklistGrid({ items, values, onChange }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr auto", rowGap: 6, columnGap: 12 }}>
      {items.map((name) => (
        <React.Fragment key={name}>
          <div style={{ fontSize: 13, alignSelf: "center" }}>{name}</div>
          <select value={values[name] || "Not Started"} onChange={(e) => onChange(name, e.target.value)}
            style={{ fontSize: 11.5, padding: "4px 8px", borderRadius: 6, border: `1px solid ${LINE}`, background: "#fff", color: STATUS_COLOR[values[name]] || INK }}>
            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </React.Fragment>
      ))}
    </div>
  );
}

function ProducerHome({ data, setTab, update }) {
  const episodes = data.episodes;
  const stuck = [];
  episodes.forEach((ep) => { if (!ep.nextMilestone) stuck.push(`${ep.title} has no next milestone set`); });
  const recent = data.milestones.filter((m) => m.kind === "recent").slice(-5).reverse();
  const upcoming = data.milestones.filter((m) => m.kind === "upcoming").slice(0, 5);
  const [importModal, setImportModal] = useState(false);
  const [importText, setImportText] = useState("");
  const [importError, setImportError] = useState("");
  const [exportModal, setExportModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const exportText = JSON.stringify(data, null, 2);
  const copyExport = async () => {
    try { await navigator.clipboard.writeText(exportText); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch {}
  };
  const runImport = () => {
    setImportError("");
    try {
      const parsed = JSON.parse(importText);
      if (!parsed.episodes || !Array.isArray(parsed.episodes)) throw new Error("That doesn't look like tracker data (no episodes array found).");
      update(parsed);
      setImportModal(false);
      setImportText("");
    } catch (e) { setImportError(e.message || "Couldn't parse that — make sure you copied the entire export block."); }
  };

  return (
    <div style={{ padding: 28 }}>
      <h1 className="serif" style={{ fontSize: 26, marginBottom: 4 }}>Producer Home</h1>
      <p style={{ color: MUTE, fontSize: 13, marginBottom: 24 }}>Source of truth for {data.seriesTitle}.</p>

      <div style={{ background: "#fff", border: `1px solid ${GOLD}`, borderRadius: 12, padding: 16, marginBottom: 16 }}>
        <div className="mono" style={{ fontSize: 10.5, color: GOLD, textTransform: "uppercase", marginBottom: 8 }}>Data Migration &amp; Backup</div>
        <p style={{ fontSize: 12.5, color: MUTE, marginBottom: 10 }}>Import replaces everything currently in this tracker — use it once, to bring over data from the old Claude version. Export is for keeping a backup copy any time.</p>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => setImportModal(true)} style={{ background: INK, color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 12.5 }}>Import Data</button>
          <button onClick={() => setExportModal(true)} style={{ background: "#fff", color: INK, border: `1px solid ${LINE}`, borderRadius: 8, padding: "8px 16px", fontSize: 12.5 }}>Export Data</button>
        </div>
      </div>

      {importModal && (
        <Modal title="Import Data" onClose={() => setImportModal(false)}>
          <p style={{ fontSize: 12, color: MUTE, marginBottom: 8 }}>Paste the entire export block copied from the old Claude tracker (Producer Backend &gt; Home &gt; Export All Data). This will overwrite everything currently here.</p>
          <textarea value={importText} onChange={(e) => setImportText(e.target.value)} placeholder="Paste JSON here…" style={{ ...inputStyle, minHeight: 200, fontFamily: "monospace", fontSize: 11 }} />
          {importError && <p style={{ color: CLAY, fontSize: 12, margin: "8px 0 0" }}>{importError}</p>}
          <button onClick={runImport} style={{ width: "100%", background: INK, color: "#fff", border: "none", borderRadius: 8, padding: 10, fontSize: 13, marginTop: 10 }}>Import &amp; Overwrite</button>
        </Modal>
      )}
      {exportModal && (
        <Modal title="Export All Data" onClose={() => setExportModal(false)}>
          <textarea readOnly value={exportText} onFocus={(e) => e.target.select()} style={{ ...inputStyle, minHeight: 220, fontFamily: "monospace", fontSize: 11 }} />
          <button onClick={copyExport} style={{ width: "100%", background: INK, color: "#fff", border: "none", borderRadius: 8, padding: 10, fontSize: 13, marginTop: 10 }}>{copied ? "Copied!" : "Copy to Clipboard"}</button>
        </Modal>
      )}

      <div style={{ background: "#fff", border: `1px solid ${LINE}`, borderRadius: 12, padding: 16, marginBottom: 16 }}>
        <div className="mono" style={{ fontSize: 10.5, color: GOLD, textTransform: "uppercase", marginBottom: 8 }}>Series Settings</div>
        <Field label="Series Logline (shown under the title in Client View)">
          <textarea style={{ ...inputStyle, minHeight: 54 }} value={data.seriesLogline || ""} onChange={(e) => update({ ...data, seriesLogline: e.target.value })} />
        </Field>
        <Field label="Photo Gallery Link (shown at top of Client View)">
          <input style={inputStyle} placeholder="https://photos.google.com/share/..." value={data.galleryUrl || ""} onChange={(e) => update({ ...data, galleryUrl: e.target.value })} />
        </Field>
        <p style={{ fontSize: 11.5, color: MUTE, margin: "4px 0 0" }}>Point this at wherever your BTS photos already live — a Google Photos album, a Dropbox or Drive folder, etc. It shows as a button clients can open in a new tab.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 16 }}>
        <Panel title="Where we are" icon={HomeIcon}>
          {episodes.map((ep) => (
            <div key={ep.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, padding: "5px 0" }}>
              <span>{ep.title}</span><span className="mono" style={{ color: MUTE }}>{currentPhaseLabels(ep).join(" + ")} &middot; {episodeCompletion(ep)}%</span>
            </div>
          ))}
        </Panel>
        <Panel title="What needs attention" icon={AlertCircle}>
          {stuck.length === 0 && <p style={{ fontSize: 12.5, color: MUTE }}>Nothing flagged.</p>}
          {stuck.slice(0, 8).map((s, i) => <div key={i} style={{ fontSize: 12.5, padding: "5px 0", color: CLAY }}>{s}</div>)}
        </Panel>
        <Panel title="Recently happened" icon={Sparkles}>
          {recent.length === 0 && <p style={{ fontSize: 12.5, color: MUTE }}>Nothing logged yet.</p>}
          {recent.map((m) => <div key={m.id} style={{ fontSize: 12.5, padding: "5px 0" }}>{m.text}</div>)}
        </Panel>
        <Panel title="Coming up" icon={Clock}>
          {upcoming.length === 0 && <p style={{ fontSize: 12.5, color: MUTE }}>Nothing scheduled yet.</p>}
          {upcoming.map((m) => <div key={m.id} style={{ fontSize: 12.5, padding: "5px 0" }}>{m.text}</div>)}
        </Panel>
      </div>

      <div style={{ marginTop: 24, display: "flex", gap: 10, flexWrap: "wrap" }}>
        {[
          ["episodes", "Update Episode Status", Layers],
          ["interviews", "Add Interview", Users],
          ["days", "Add Production Day", Calendar],
          ["milestones", "Add Milestone", Sparkles],
        ].map(([key, label, Icon]) => (
          <button key={key} onClick={() => setTab(key)} style={{ display: "flex", alignItems: "center", gap: 8, background: INK, color: CREAM, border: "none", borderRadius: 10, padding: "10px 16px", fontSize: 13 }}>
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>
    </div>
  );
}

function Panel({ title, icon: Icon, children }) {
  return (
    <div style={{ background: "#fff", border: `1px solid ${LINE}`, borderRadius: 12, padding: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, color: GOLD }}>
        <Icon size={15} /><span className="mono" style={{ fontSize: 10.5, textTransform: "uppercase" }}>{title}</span>
      </div>
      {children}
    </div>
  );
}

function ProducerEpisodes({ data, update, selected, setSelected }) {
  const ep = data.episodes.find((e) => e.id === selected) || data.episodes[0];
  const updateEp = (patch) => update({ ...data, episodes: data.episodes.map((e) => (e.id === ep.id ? { ...e, ...patch } : e)) });
  const updatePhaseItem = (phaseKey, item, val) => updateEp({ phases: { ...ep.phases, [phaseKey]: { ...ep.phases[phaseKey], [item]: val } } });
  const moveToPosition = (fromIndex, toPosition) => {
    const arr = [...data.episodes];
    const [item] = arr.splice(fromIndex, 1);
    arr.splice(toPosition - 1, 0, item);
    update({ ...data, episodes: arr.map((e, i) => ({ ...e, number: i + 1 })) });
  };

  return (
    <div style={{ display: "flex", height: "100%" }}>
      <div style={{ width: 210, borderRight: `1px solid ${LINE}`, overflowY: "auto", flexShrink: 0 }}>
        {data.episodes.map((e, idx) => (
          <div key={e.id} style={{ display: "flex", alignItems: "center", background: e.id === ep.id ? CREAM_2 : "transparent", borderBottom: `1px solid ${LINE}` }}>
            <select value={idx + 1} onChange={(ev) => moveToPosition(idx, Number(ev.target.value))} onClick={(ev) => ev.stopPropagation()}
              style={{ fontSize: 11, border: "none", background: "transparent", color: MUTE, padding: "10px 4px 10px 10px", cursor: "pointer" }}>
              {data.episodes.map((_, i) => <option key={i} value={i + 1}>{i + 1}</option>)}
            </select>
            <button onClick={() => setSelected(e.id)} style={{ flex: 1, display: "block", textAlign: "left", padding: "10px 14px 10px 4px", background: "transparent", border: "none", fontSize: 12.5 }}>
              <div style={{ fontWeight: 600 }}>{e.title}</div>
              <div className="mono" style={{ fontSize: 10, color: MUTE }}>{episodeCompletion(e)}% &middot; {currentPhaseLabels(e).join(" + ")}</div>
            </button>
          </div>
        ))}
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 18 }}>
          <Field label="Title"><input value={ep.title} onChange={(e) => updateEp({ title: e.target.value })} style={inputStyle} /></Field>
          <Field label="Champion / Primary Voice"><input value={ep.champion} onChange={(e) => updateEp({ champion: e.target.value })} style={inputStyle} /></Field>
          <Field label="Producer (1)"><input value={ep.producer1 ?? ep.producer ?? ""} onChange={(e) => updateEp({ producer1: e.target.value })} style={inputStyle} /></Field>
          <Field label="Producer (2)"><input value={ep.producer2 || ""} onChange={(e) => updateEp({ producer2: e.target.value })} style={inputStyle} /></Field>
          <Field label="Editor"><input value={ep.editor} onChange={(e) => updateEp({ editor: e.target.value })} style={inputStyle} /></Field>
          <Field label="Director"><input value={ep.director || ""} onChange={(e) => updateEp({ director: e.target.value })} style={inputStyle} /></Field>
          <Field label="Executive Producer (1)"><input value={ep.execProducer1 || ""} onChange={(e) => updateEp({ execProducer1: e.target.value })} style={inputStyle} /></Field>
          <Field label="Executive Producer (2)"><input value={ep.execProducer2 || ""} onChange={(e) => updateEp({ execProducer2: e.target.value })} style={inputStyle} /></Field>
          <Field label="Priority">
            <select value={ep.priority} onChange={(e) => updateEp({ priority: e.target.value })} style={inputStyle}>
              {["High", "Medium", "Low"].map((p) => <option key={p}>{p}</option>)}
            </select>
          </Field>
          <Field label="Target Completion Date"><input type="date" value={ep.targetDate} onChange={(e) => updateEp({ targetDate: e.target.value })} style={inputStyle} /></Field>
          <Field label="Data Size Captured (TB)"><input type="number" step="0.1" value={ep.dataSizeTB || ""} onChange={(e) => updateEp({ dataSizeTB: e.target.value })} style={inputStyle} /></Field>
          <Field label="Hours of Footage Captured"><input type="number" step="0.1" value={ep.hoursFootage || ""} onChange={(e) => updateEp({ hoursFootage: e.target.value })} style={inputStyle} /></Field>
          <Field label="Current Phase(s) — shown to client">
            <div style={{ display: "flex", flexDirection: "column", gap: 6, background: "#fff", border: `1px solid ${LINE}`, borderRadius: 8, padding: 10 }}>
              {[...PHASES.map((p) => p.label), "Complete"].map((label) => {
                const checked = (ep.activePhases || []).includes(label);
                return (
                  <label key={label} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5 }}>
                    <input type="checkbox" checked={checked} onChange={(e) => {
                      const cur = ep.activePhases || [];
                      updateEp({ activePhases: e.target.checked ? [...cur, label] : cur.filter((l) => l !== label) });
                    }} />
                    {label}
                  </label>
                );
              })}
              <button type="button" onClick={() => updateEp({ activePhases: [] })} style={{ alignSelf: "flex-start", fontSize: 11, color: MUTE, background: "none", border: "none", textDecoration: "underline", padding: "2px 0 0" }}>
                Reset to auto (calculate from checklist)
              </button>
            </div>
          </Field>
          <Field label="Champion Accent Color">
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input type="color" value={ep.accentColor || GOLD} onChange={(e) => updateEp({ accentColor: e.target.value })} style={{ width: 40, height: 34, border: `1px solid ${LINE}`, borderRadius: 6, padding: 2, background: "#fff" }} />
              <input value={ep.accentColor || ""} onChange={(e) => updateEp({ accentColor: e.target.value })} placeholder="#C9922B" style={{ ...inputStyle, flex: 1 }} />
            </div>
          </Field>
          <Field label="Cover Image (shown on client card + episode page)">
            <input type="file" accept="image/*" style={{ fontSize: 12 }} onChange={async (e) => {
              const file = e.target.files[0];
              if (!file) return;
              try { const dataUrl = await resizeImageFile(file); updateEp({ coverImageUrl: dataUrl }); }
              catch { alert("Couldn't read that image — try a different file."); }
            }} />
            {ep.coverImageUrl && (
              <div style={{ position: "relative", marginTop: 8 }}>
                <img src={ep.coverImageUrl} alt="" style={{ width: "100%", height: 90, objectFit: "cover", borderRadius: 8, border: `1px solid ${LINE}` }} onError={handleImgError} />
                <button type="button" onClick={() => updateEp({ coverImageUrl: "" })} style={{ position: "absolute", top: 6, right: 6, background: "rgba(36,31,26,0.75)", color: "#fff", border: "none", borderRadius: 6, fontSize: 10, padding: "3px 8px" }}>Remove</button>
              </div>
            )}
            <p style={{ fontSize: 11, color: MUTE, margin: "6px 0 0" }}>Uploaded directly — no external links needed, and it'll always load reliably.</p>
          </Field>
        </div>
        <Field label="Current Status Summary (client-visible)"><textarea value={ep.statusSummary} onChange={(e) => updateEp({ statusSummary: e.target.value })} style={{ ...inputStyle, minHeight: 54 }} /></Field>
        <Field label="Next Milestone (client-visible)"><textarea value={ep.nextMilestone} onChange={(e) => updateEp({ nextMilestone: e.target.value })} style={{ ...inputStyle, minHeight: 44 }} /></Field>

        <div style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 18 }}>
          {PHASES.map((p) => (
            <div key={p.key} style={{ border: `1px solid ${LINE}`, borderRadius: 12, padding: 16, background: "#fff" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <span className="serif" style={{ fontWeight: 600 }}>{p.label}</span>
                <span className="mono" style={{ fontSize: 12, color: GOLD }}>{phasePercent(ep.phases[p.key], p.items)}%</span>
              </div>
              <ChecklistGrid items={p.items} values={ep.phases[p.key]} onChange={(item, val) => updatePhaseItem(p.key, item, val)} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return <div style={{ marginBottom: 12 }}><div className="mono" style={{ fontSize: 10, color: MUTE, marginBottom: 4, textTransform: "uppercase" }}>{label}</div>{children}</div>;
}
const inputStyle = { width: "100%", padding: "8px 10px", borderRadius: 8, border: `1px solid ${LINE}`, fontSize: 13, background: "#fff" };

function DataTable({ columns, rows, onDelete, onEdit }) {
  return (
    <div style={{ border: `1px solid ${LINE}`, borderRadius: 12, overflow: "hidden" }}>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${columns.length}, 1fr) ${onEdit ? "32px " : ""}32px`, background: CREAM_2, padding: "8px 12px" }}>
        {columns.map((c) => <div key={c} className="mono" style={{ fontSize: 10, color: MUTE, textTransform: "uppercase" }}>{c}</div>)}
        {onEdit && <div />}
        <div />
      </div>
      {rows.length === 0 && <div style={{ padding: 16, fontSize: 12.5, color: MUTE }}>Nothing added yet.</div>}
      {rows.map((r, idx) => (
        <div key={r.id} style={{ display: "grid", gridTemplateColumns: `repeat(${columns.length}, 1fr) ${onEdit ? "32px " : ""}32px`, padding: "9px 12px", borderTop: `1px solid ${LINE}`, fontSize: 12.5, alignItems: "center", background: "#fff" }}>
          {r.cells}
          {onEdit && <button onClick={() => onEdit(r.id)} style={{ background: "none", border: "none", color: MUTE }}><Pencil size={13} /></button>}
          <button onClick={() => onDelete(r.id)} style={{ background: "none", border: "none", color: MUTE }}><X size={14} /></button>
        </div>
      ))}
    </div>
  );
}

function AddBar({ label, onClick }) {
  return (
    <button onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 6, background: GOLD, color: "#fff", border: "none", borderRadius: 8, padding: "8px 14px", fontSize: 12.5, marginBottom: 14 }}>
      <Plus size={14} /> {label}
    </button>
  );
}

function FilterBar({ episodes, filters, setFilters, searchPlaceholder, showEpisode = true }) {
  const active = filters.episodeId || filters.search || filters.dateFrom || filters.dateTo;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", background: "#fff", border: `1px solid ${LINE}`, borderRadius: 10, padding: 10, marginBottom: 14 }}>
      <Search size={14} color={MUTE} style={{ flexShrink: 0 }} />
      <input value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} placeholder={searchPlaceholder} style={{ ...inputStyle, width: 180, flex: "1 1 180px" }} />
      {showEpisode && (
        <select value={filters.episodeId} onChange={(e) => setFilters({ ...filters, episodeId: e.target.value })} style={{ ...inputStyle, width: "auto" }}>
          <option value="">All Episodes</option>
          {episodes.map((e) => <option key={e.id} value={e.id}>{e.title}</option>)}
        </select>
      )}
      <span style={{ fontSize: 11, color: MUTE }}>From</span>
      <input type="date" value={filters.dateFrom} onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })} style={{ ...inputStyle, width: "auto" }} />
      <span style={{ fontSize: 11, color: MUTE }}>To</span>
      <input type="date" value={filters.dateTo} onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })} style={{ ...inputStyle, width: "auto" }} />
      {active && (
        <button onClick={() => setFilters({ episodeId: "", search: "", dateFrom: "", dateTo: "" })} style={{ fontSize: 11.5, color: CLAY, background: "none", border: "none", textDecoration: "underline", marginLeft: "auto" }}>
          Clear filters
        </button>
      )}
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(36,31,26,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 14, padding: 22, width: "min(420px, 92vw)", maxHeight: "85vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
          <span className="serif" style={{ fontSize: 18, fontWeight: 600 }}>{title}</span>
          <button onClick={onClose} style={{ background: "none", border: "none" }}><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function parseBulkRows(text) {
  // Tab-separated (typical when pasted from Excel/Sheets) — simple split is safe here
  // since tabs rarely appear inside real field values.
  if (text.includes("\t")) {
    return text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean).map((l) => l.split("\t").map((c) => c.trim()));
  }
  // Comma-separated (a real .csv file) — needs proper quote handling so commas
  // inside a field (e.g. "Portland, OR") don't get treated as column breaks.
  const rows = [];
  let row = [], field = "", inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else inQuotes = false; }
      else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ",") { row.push(field.trim()); field = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field.trim()); field = "";
      if (row.some((x) => x !== "")) rows.push(row);
      row = [];
    } else field += c;
  }
  if (field !== "" || row.length) { row.push(field.trim()); if (row.some((x) => x !== "")) rows.push(row); }
  return rows;
}
function downloadTemplate(filename, headerRow, exampleRow) {
  const csv = [headerRow, exampleRow].map((r) => r.map((c) => (c.includes(",") ? `"${c}"` : c)).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}
function FileImportInput({ onText }) {
  return (
    <input type="file" accept=".csv,.tsv,.txt" style={{ fontSize: 12, marginBottom: 10 }}
      onChange={(e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => onText(evt.target.result);
        reader.readAsText(file);
        e.target.value = "";
      }} />
  );
}
function matchEpisode(data, str) {
  if (!str) return null;
  const s = str.trim().toLowerCase();
  const byNum = s.match(/\d+/);
  let found = data.episodes.find((e) => e.title.toLowerCase() === s);
  if (!found) found = data.episodes.find((e) => e.title.toLowerCase().includes(s) || s.includes(e.title.toLowerCase()));
  if (!found && byNum) found = data.episodes.find((e) => e.number === Number(byNum[0]));
  return found ? found.id : null;
}

function ProducerInterviews({ data, update }) {
  const [modal, setModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [bulkModal, setBulkModal] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const [bulkResult, setBulkResult] = useState(null);
  const blankForm = { person: "", episodeId: data.episodes[0]?.id, type: "Primary Voice", descriptor: "", description: "", date: "", location: "", runtime: "", viewingLink: "", transcriptLink: "" };
  const [form, setForm] = useState(blankForm);
  const openAdd = () => { setEditingId(null); setForm(blankForm); setModal(true); };
  const openEdit = (id) => {
    const iv = data.interviews.find((i) => i.id === id);
    if (!iv) return;
    setEditingId(id);
    setForm({ ...blankForm, ...iv });
    setModal(true);
  };
  const save = () => {
    if (editingId) {
      update({ ...data, interviews: data.interviews.map((i) => (i.id === editingId ? { ...i, ...form } : i)) });
    } else {
      update({ ...data, interviews: [...data.interviews, { id: uid("iv"), ...form }] });
    }
    setModal(false); setEditingId(null); setForm(blankForm);
  };
  const del = (id) => update({ ...data, interviews: data.interviews.filter((i) => i.id !== id) });
  const [filters, setFilters] = useState({ episodeId: "", search: "", dateFrom: "", dateTo: "" });
  const filteredInterviews = data.interviews.filter((i) => {
    if (filters.episodeId && i.episodeId !== filters.episodeId) return false;
    if (filters.dateFrom && (!i.date || i.date < filters.dateFrom)) return false;
    if (filters.dateTo && (!i.date || i.date > filters.dateTo)) return false;
    if (filters.search) {
      const s = filters.search.toLowerCase();
      const hay = [i.person, i.description, i.location, i.org].filter(Boolean).join(" ").toLowerCase();
      if (!hay.includes(s)) return false;
    }
    return true;
  });
  const importBulk = () => {
    const rows = parseBulkRows(bulkText);
    let added = 0, skipped = 0;
    const newInterviews = [];
    rows.forEach((cols) => {
      if (/^(person|name)$/i.test(cols[0] || "")) return; // skip header row
      const person = cols[0];
      const episodeId = matchEpisode(data, cols[1]);
      if (!person || !episodeId) { skipped++; return; }
      const typeRaw = (cols[2] || "").toLowerCase();
      const type = typeRaw.includes("supp") ? "Supplementary Voice" : "Primary Voice";
      newInterviews.push({ id: uid("iv"), person, episodeId, type, descriptor: "", description: cols[3] || "", date: cols[4] || "", location: cols[5] || "", runtime: "", viewingLink: cols[6] || "", transcriptLink: cols[7] || "" });
      added++;
    });
    update({ ...data, interviews: [...data.interviews, ...newInterviews] });
    setBulkResult({ added, skipped });
    setBulkText("");
  };

  return (
    <div style={{ padding: 24 }}>
      <h1 className="serif" style={{ fontSize: 22, marginBottom: 14 }}>Interviews</h1>
      <div style={{ display: "flex", gap: 10 }}>
        <AddBar label="Add Interview" onClick={openAdd} />
        <button onClick={() => { setBulkModal(true); setBulkResult(null); }} style={{ display: "flex", alignItems: "center", gap: 6, background: "#fff", border: `1px solid ${LINE}`, color: INK, borderRadius: 8, padding: "8px 14px", fontSize: 12.5, marginBottom: 14, height: "fit-content" }}>
          Import CSV
        </button>
      </div>
      <FilterBar episodes={data.episodes} filters={filters} setFilters={setFilters} searchPlaceholder="Search person, description, location…" />
      {filteredInterviews.length !== data.interviews.length && <p style={{ fontSize: 11.5, color: MUTE, marginTop: -8, marginBottom: 10 }}>Showing {filteredInterviews.length} of {data.interviews.length}</p>}
      <DataTable columns={["Person", "Episode", "Type", "Description", "Date"]} rows={filteredInterviews.map((i) => ({ id: i.id, cells: [i.person, data.episodes.find((e) => e.id === i.episodeId)?.title || "—", i.type, <span key="d" style={{ color: MUTE, fontSize: 11.5 }}>{(i.description || "—").slice(0, 40)}{(i.description || "").length > 40 ? "…" : ""}</span>, i.date] }))} onDelete={del} onEdit={openEdit} />
      {bulkModal && (
        <Modal title="Import Interviews" onClose={() => setBulkModal(false)}>
          <button type="button" onClick={() => downloadTemplate("interviews-template.csv", ["Person", "Episode", "Type", "Description", "Date", "Location", "Viewing Link", "Transcript Link"], ["Maria Alvarez", "Episode 1", "Primary Voice", "Discussed her early years volunteering", "2026-03-14", "Portland, OR", "", ""])} style={{ fontSize: 11.5, color: GOLD, background: "none", border: "none", textDecoration: "underline", padding: 0, marginBottom: 10, display: "block" }}>
            Download a blank CSV template
          </button>
          <p style={{ fontSize: 12, color: MUTE, marginBottom: 8 }}>
            Open that template in Excel or Google Sheets, fill in your rows, save/export as CSV, then upload it below. Columns:
          </p>
          <p className="mono" style={{ fontSize: 10.5, color: GOLD, marginBottom: 10, lineHeight: 1.6 }}>
            Person, Episode (title or number), Type (Primary/Supplementary), Description, Date, Location, Viewing Link, Transcript Link
          </p>
          <p style={{ fontSize: 11.5, color: MUTE, marginBottom: 10 }}>Only Person and Episode are required. Header row is fine, it's skipped automatically.</p>
          <FileImportInput onText={setBulkText} />
          <details style={{ marginBottom: 10 }}>
            <summary style={{ fontSize: 11.5, color: MUTE, cursor: "pointer" }}>Or paste rows directly instead</summary>
            <textarea value={bulkText} onChange={(e) => setBulkText(e.target.value)} placeholder={"Maria Alvarez\tEpisode 1\tPrimary Voice\tDiscussed her early years\t2026-03-14\tPortland, OR"} style={{ ...inputStyle, minHeight: 100, fontFamily: "monospace", fontSize: 12, marginTop: 8 }} />
          </details>
          {bulkText && <p style={{ fontSize: 11.5, color: MUTE, margin: "0 0 8px" }}>{parseBulkRows(bulkText).length} row(s) ready to import.</p>}
          {bulkResult && <p style={{ fontSize: 12, color: bulkResult.skipped ? CLAY : SAGE, margin: "8px 0 0" }}>Imported {bulkResult.added}. {bulkResult.skipped > 0 && `${bulkResult.skipped} skipped (missing name or unmatched episode).`}</p>}
          <button onClick={importBulk} disabled={!bulkText} style={{ width: "100%", background: INK, color: "#fff", border: "none", borderRadius: 8, padding: 10, fontSize: 13, marginTop: 10, opacity: bulkText ? 1 : 0.5 }}>Import Rows</button>
        </Modal>
      )}
      {modal && (
        <Modal title={editingId ? "Edit Interview" : "Add Interview"} onClose={() => { setModal(false); setEditingId(null); }}>
          <Field label="Person"><input style={inputStyle} value={form.person} onChange={(e) => setForm({ ...form, person: e.target.value })} /></Field>
          <Field label="Episode"><select style={inputStyle} value={form.episodeId} onChange={(e) => setForm({ ...form, episodeId: e.target.value })}>{data.episodes.map((e) => <option key={e.id} value={e.id}>{e.title}</option>)}</select></Field>
          <Field label="Type"><select style={inputStyle} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}><option>Primary Voice</option><option>Supplementary Voice</option></select></Field>
          {form.type === "Supplementary Voice" && <Field label="Descriptor"><select style={inputStyle} value={form.descriptor} onChange={(e) => setForm({ ...form, descriptor: e.target.value })}><option value="">—</option>{["Family","Friend","Colleague","Community member","Participant","Expert","Organization member","Other"].map((d)=><option key={d}>{d}</option>)}</select></Field>}
          <Field label="Description"><textarea style={{ ...inputStyle, minHeight: 60 }} placeholder="What was this interview about?" value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
          <Field label="Date"><input type="date" style={inputStyle} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></Field>
          <Field label="Location"><input style={inputStyle} value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></Field>
          <Field label="Viewing Link"><input style={inputStyle} value={form.viewingLink} onChange={(e) => setForm({ ...form, viewingLink: e.target.value })} /></Field>
          <Field label="Transcript Link"><input style={inputStyle} value={form.transcriptLink} onChange={(e) => setForm({ ...form, transcriptLink: e.target.value })} /></Field>
          <button onClick={save} style={{ width: "100%", background: INK, color: "#fff", border: "none", borderRadius: 8, padding: 10, fontSize: 13, marginTop: 6 }}>{editingId ? "Save Changes" : "Save Interview"}</button>
        </Modal>
      )}
    </div>
  );
}

function ProducerDays({ data, update }) {
  const [modal, setModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [bulkModal, setBulkModal] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const [bulkResult, setBulkResult] = useState(null);
  const blankForm = { episodeId: data.episodes[0]?.id, date: "", city: "", state: "", country: "", location: "", type: "", notes: "" };
  const [form, setForm] = useState(blankForm);
  const openAdd = () => { setEditingId(null); setForm(blankForm); setModal(true); };
  const openEdit = (id) => {
    const pd = data.productionDays.find((d) => d.id === id);
    if (!pd) return;
    setEditingId(id);
    setForm({ ...blankForm, ...pd });
    setModal(true);
  };
  const save = () => {
    if (editingId) {
      update({ ...data, productionDays: data.productionDays.map((d) => (d.id === editingId ? { ...d, ...form } : d)) });
    } else {
      update({ ...data, productionDays: [...data.productionDays, { id: uid("pd"), ...form }] });
    }
    setModal(false); setEditingId(null); setForm(blankForm);
  };
  const del = (id) => update({ ...data, productionDays: data.productionDays.filter((d) => d.id !== id) });
  const [filters, setFilters] = useState({ episodeId: "", search: "", dateFrom: "", dateTo: "" });
  const filteredDays = data.productionDays.filter((d) => {
    if (filters.episodeId && d.episodeId !== filters.episodeId) return false;
    if (filters.dateFrom && (!d.date || d.date < filters.dateFrom)) return false;
    if (filters.dateTo && (!d.date || d.date > filters.dateTo)) return false;
    if (filters.search) {
      const s = filters.search.toLowerCase();
      const hay = [d.city, d.state, d.country, d.location, d.type, d.notes].filter(Boolean).join(" ").toLowerCase();
      if (!hay.includes(s)) return false;
    }
    return true;
  });
  const importBulk = () => {
    const rows = parseBulkRows(bulkText);
    let added = 0, skipped = 0;
    const newDays = [];
    rows.forEach((cols) => {
      if (/^episode$/i.test(cols[0] || "")) return; // skip header row
      const episodeId = matchEpisode(data, cols[0]);
      if (!episodeId) { skipped++; return; }
      newDays.push({ id: uid("pd"), episodeId, date: cols[1] || "", city: cols[2] || "", state: cols[3] || "", country: cols[4] || "", location: cols[5] || "", type: cols[6] || "", notes: "" });
      added++;
    });
    update({ ...data, productionDays: [...data.productionDays, ...newDays] });
    setBulkResult({ added, skipped });
    setBulkText("");
  };

  return (
    <div style={{ padding: 24 }}>
      <h1 className="serif" style={{ fontSize: 22, marginBottom: 14 }}>Production Days</h1>
      <div style={{ display: "flex", gap: 10 }}>
        <AddBar label="Add Production Day" onClick={openAdd} />
        <button onClick={() => { setBulkModal(true); setBulkResult(null); }} style={{ display: "flex", alignItems: "center", gap: 6, background: "#fff", border: `1px solid ${LINE}`, color: INK, borderRadius: 8, padding: "8px 14px", fontSize: 12.5, marginBottom: 14, height: "fit-content" }}>
          Import CSV
        </button>
      </div>
      <FilterBar episodes={data.episodes} filters={filters} setFilters={setFilters} searchPlaceholder="Search city, state, country, location…" />
      {filteredDays.length !== data.productionDays.length && <p style={{ fontSize: 11.5, color: MUTE, marginTop: -8, marginBottom: 10 }}>Showing {filteredDays.length} of {data.productionDays.length}</p>}
      <DataTable columns={["Episode", "Date", "City", "Country", "Location"]} rows={filteredDays.map((d) => ({ id: d.id, cells: [data.episodes.find((e) => e.id === d.episodeId)?.title || "—", d.date, d.city, d.country, d.location] }))} onDelete={del} onEdit={openEdit} />
      {bulkModal && (
        <Modal title="Import Production Days" onClose={() => setBulkModal(false)}>
          <button type="button" onClick={() => downloadTemplate("production-days-template.csv", ["Episode", "Date", "City", "State", "Country", "Location", "Type"], ["Episode 1", "2026-03-14", "Portland", "OR", "USA", "Community Center", "Interview"])} style={{ fontSize: 11.5, color: GOLD, background: "none", border: "none", textDecoration: "underline", padding: 0, marginBottom: 10, display: "block" }}>
            Download a blank CSV template
          </button>
          <p style={{ fontSize: 12, color: MUTE, marginBottom: 8 }}>
            Open that template in Excel or Google Sheets, fill in your rows, save/export as CSV, then upload it below. Columns:
          </p>
          <p className="mono" style={{ fontSize: 10.5, color: GOLD, marginBottom: 10, lineHeight: 1.6 }}>
            Episode (title or number), Date, City, State, Country, Location, Type
          </p>
          <p style={{ fontSize: 11.5, color: MUTE, marginBottom: 10 }}>Only Episode is required. Header row is fine, it's skipped automatically.</p>
          <FileImportInput onText={setBulkText} />
          <details style={{ marginBottom: 10 }}>
            <summary style={{ fontSize: 11.5, color: MUTE, cursor: "pointer" }}>Or paste rows directly instead</summary>
            <textarea value={bulkText} onChange={(e) => setBulkText(e.target.value)} placeholder={"Episode 1\t2026-03-14\tPortland\tOR\tUSA\tCommunity Center\tInterview"} style={{ ...inputStyle, minHeight: 100, fontFamily: "monospace", fontSize: 12, marginTop: 8 }} />
          </details>
          {bulkText && <p style={{ fontSize: 11.5, color: MUTE, margin: "0 0 8px" }}>{parseBulkRows(bulkText).length} row(s) ready to import.</p>}
          {bulkResult && <p style={{ fontSize: 12, color: bulkResult.skipped ? CLAY : SAGE, margin: "8px 0 0" }}>Imported {bulkResult.added}. {bulkResult.skipped > 0 && `${bulkResult.skipped} skipped (unmatched episode).`}</p>}
          <button onClick={importBulk} disabled={!bulkText} style={{ width: "100%", background: INK, color: "#fff", border: "none", borderRadius: 8, padding: 10, fontSize: 13, marginTop: 10, opacity: bulkText ? 1 : 0.5 }}>Import Rows</button>
        </Modal>
      )}
      {modal && (
        <Modal title={editingId ? "Edit Production Day" : "Add Production Day"} onClose={() => { setModal(false); setEditingId(null); }}>
          <Field label="Episode"><select style={inputStyle} value={form.episodeId} onChange={(e) => setForm({ ...form, episodeId: e.target.value })}>{data.episodes.map((e) => <option key={e.id} value={e.id}>{e.title}</option>)}</select></Field>
          <Field label="Date"><input type="date" style={inputStyle} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></Field>
          <Field label="City"><input style={inputStyle} value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></Field>
          <Field label="State / Province"><input style={inputStyle} value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} /></Field>
          <Field label="Country"><input style={inputStyle} value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} /></Field>
          <Field label="Location Name"><input style={inputStyle} value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></Field>
          <Field label="Production Type"><input style={inputStyle} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} placeholder="Interview, B-roll, Observational..." /></Field>
          <Field label="Notes"><textarea style={inputStyle} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></Field>
          <button onClick={save} style={{ width: "100%", background: INK, color: "#fff", border: "none", borderRadius: 8, padding: 10, fontSize: 13, marginTop: 6 }}>{editingId ? "Save Changes" : "Save Production Day"}</button>
        </Modal>
      )}
    </div>
  );
}

function ProducerMilestones({ data, update }) {
  const [modal, setModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const blankForm = { episodeId: data.episodes[0]?.id, date: "", text: "", kind: "recent" };
  const [form, setForm] = useState(blankForm);
  const openAdd = () => { setEditingId(null); setForm(blankForm); setModal(true); };
  const openEdit = (id) => {
    const m = data.milestones.find((x) => x.id === id);
    if (!m) return;
    setEditingId(id);
    setForm({ ...blankForm, ...m });
    setModal(true);
  };
  const save = () => {
    if (editingId) {
      update({ ...data, milestones: data.milestones.map((m) => (m.id === editingId ? { ...m, ...form } : m)) });
    } else {
      update({ ...data, milestones: [...data.milestones, { id: uid("ms"), ...form }] });
    }
    setModal(false); setEditingId(null); setForm(blankForm);
  };
  const del = (id) => update({ ...data, milestones: data.milestones.filter((m) => m.id !== id) });

  return (
    <div style={{ padding: 24 }}>
      <h1 className="serif" style={{ fontSize: 22, marginBottom: 14 }}>Recent Progress</h1>
      <p style={{ fontSize: 12.5, color: MUTE, marginBottom: 14 }}>These need a date to show up on Client View's "Recent Progress" card — anything dated within the last 30 days shows under "Last 30 Days," anything dated within the next 30 days shows under "Next 30 Days." They also feed the Producer Home overview panels.</p>
      <AddBar label="Add Milestone" onClick={openAdd} />
      <DataTable columns={["Episode", "Kind", "Text", "Date"]} rows={data.milestones.map((m) => ({ id: m.id, cells: [data.episodes.find((e) => e.id === m.episodeId)?.title || "Series-wide", m.kind, m.text, m.date] }))} onDelete={del} onEdit={openEdit} />
      {modal && (
        <Modal title={editingId ? "Edit Milestone" : "Add Milestone"} onClose={() => { setModal(false); setEditingId(null); }}>
          <Field label="Episode"><select style={inputStyle} value={form.episodeId} onChange={(e) => setForm({ ...form, episodeId: e.target.value })}>{data.episodes.map((e) => <option key={e.id} value={e.id}>{e.title}</option>)}</select></Field>
          <Field label="Kind"><select style={inputStyle} value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value })}><option value="recent">Recent</option><option value="upcoming">Upcoming</option></select></Field>
          <Field label="Text"><textarea style={inputStyle} value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} /></Field>
          <Field label="Date"><input type="date" style={inputStyle} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></Field>
          <button onClick={save} style={{ width: "100%", background: INK, color: "#fff", border: "none", borderRadius: 8, padding: 10, fontSize: 13, marginTop: 6 }}>{editingId ? "Save Changes" : "Save Milestone"}</button>
        </Modal>
      )}
    </div>
  );
}

// ---------- App shell ----------
function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) setError(error.message);
  };
  return (
    <div style={{ maxWidth: 360, margin: "80px auto", padding: 28, background: "#fff", border: `1px solid ${LINE}`, borderRadius: 14 }}>
      <h2 className="serif" style={{ fontSize: 22, marginBottom: 4 }}>Producer Sign In</h2>
      <p style={{ fontSize: 12.5, color: MUTE, marginBottom: 18 }}>Client View doesn't need an account — this is only for producers and editors.</p>
      <form onSubmit={submit}>
        <Field label="Email"><input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} /></Field>
        <Field label="Password"><input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} /></Field>
        {error && <p style={{ color: CLAY, fontSize: 12, margin: "0 0 10px" }}>{error}</p>}
        <button type="submit" disabled={loading} style={{ width: "100%", background: INK, color: "#fff", border: "none", borderRadius: 8, padding: 10, fontSize: 13 }}>{loading ? "Signing in…" : "Sign In"}</button>
      </form>
      <p style={{ fontSize: 11, color: MUTE, marginTop: 14 }}>Don't have an account? Ask whoever set up this site to add you in Supabase.</p>
    </div>
  );
}

export default function App() {
  const [data, setData] = useState(null);
  const [view, setView] = useState("client");
  const [clientDark, setClientDark] = useState(false);
  const [session, setSession] = useState(null);
  const [authLoaded, setAuthLoaded] = useState(false);
  const [clientEpisode, setClientEpisode] = useState(null);
  const [producerTab, setProducerTab] = useState("home");
  const [producerEpSel, setProducerEpSel] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let channel;
    (async () => {
      try {
        const { data: row, error } = await supabase.from("tracker_data").select("data").eq("id", "main").single();
        let loaded;
        if (error || !row) {
          loaded = initialData();
          await supabase.from("tracker_data").upsert({ id: "main", data: loaded });
        } else {
          loaded = { ...initialData(), ...row.data };
        }
        if (loaded.seriesTitle === "For the Love Of") loaded.seriesTitle = "For the Love";
        if (!loaded.seriesLogline) loaded.seriesLogline = "A documentary series that shows how love, when lived and acted upon, can become a transformative force in the world.";
        if (loaded.galleryUrl === undefined) loaded.galleryUrl = "";
        loaded.episodes = loaded.episodes.map((e, idx) => ({
          producer1: "Brian Tortora", producer2: "Daniela Goncalves",
          execProducer1: "Brian Tortora", execProducer2: "Daniela Goncalves",
          director: "", activePhases: idx === 0 ? ["Production", "Post-Production"] : [], accentColor: CHAMPION_ACCENTS[idx] || "", coverImageUrl: "", dataSizeTB: "", hoursFootage: "", ...e,
          editor: e.editor || "Daniel Latimer",
        }));
        setData(loaded);
      } catch (e) { console.error(e); setData(initialData()); }
    })();

    channel = supabase
      .channel("tracker_data_changes")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "tracker_data", filter: "id=eq.main" }, (payload) => {
        if (payload.new && payload.new.data) setData(payload.new.data);
      })
      .subscribe();

    return () => { if (channel) supabase.removeChannel(channel); };
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setAuthLoaded(true); });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, sess) => setSession(sess));
    return () => listener.subscription.unsubscribe();
  }, []);

  const update = async (next) => {
    setData(next);
    setSaving(true);
    try { await supabase.from("tracker_data").upsert({ id: "main", data: next, updated_at: new Date().toISOString() }); }
    catch (e) { console.error(e); }
    setSaving(false);
  };

  if (!data) return <div className="ftlo" style={{ padding: 40, color: MUTE }}>Loading tracker…</div>;

  const ep = clientEpisode ? data.episodes.find((e) => e.id === clientEpisode) : null;

  return (
    <div className="ftlo" style={{ background: clientDark && view === "client" ? "#17140F" : CREAM, minHeight: "100%", transition: "background .3s ease" }}>
      <StyleSheet />
      {/* Top switcher */}
      <div className="topbar" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8, padding: "10px 20px", background: INK, color: CREAM }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <img src={LOGO_SRC} alt={data.seriesTitle} style={{ height: 18, width: "auto", filter: "invert(1) brightness(1.6)" }} />
          <span className="mono topbar-label" style={{ fontSize: 10.5, color: MUTE, textTransform: "uppercase" }}>Tracker</span>
        </div>
        <div className="view-switch" style={{ display: "flex", gap: 4, background: "rgba(255,255,255,0.08)", borderRadius: 8, padding: 3 }}>
          {["client", "producer"].map((v) => (
            <button key={v} onClick={() => setView(v)} style={{ padding: "5px 14px", borderRadius: 6, border: "none", fontSize: 12, background: view === v ? GOLD : "transparent", color: view === v ? "#fff" : CREAM }}>
              {v === "client" ? "Client View" : "Producer Backend"}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {view === "client" && (
            <button onClick={() => setClientDark((d) => !d)} title="Toggle dark mode" style={{ display: "flex", alignItems: "center", gap: 5, background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 20, padding: "5px 10px", color: CREAM, fontSize: 11 }}>
              {clientDark ? <Sun size={13} /> : <Moon size={13} />}
            </button>
          )}
          <span className="mono topbar-label" style={{ fontSize: 10, opacity: 0.5 }}>{saving ? "saving…" : "synced"}</span>
        </div>
      </div>

      {view === "client" ? (
        <div className={`container${clientDark ? " dark" : ""}`}>
          {ep ? <ClientEpisode data={data} ep={ep} back={() => setClientEpisode(null)} /> : <ClientOverview data={data} openEpisode={setClientEpisode} />}
        </div>
      ) : !authLoaded ? (
        <div style={{ padding: 40, color: MUTE }}>Checking sign-in…</div>
      ) : !session ? (
        <LoginScreen />
      ) : (
        <div className="producer-shell">
          <div className="producer-sidebar" style={{ background: "#fff", borderRight: `1px solid ${LINE}`, paddingTop: 10, display: "flex", flexDirection: "column" }}>
            {[["home", "Home", HomeIcon], ["episodes", "Episodes", Layers], ["interviews", "Interviews", Users], ["days", "Production Days", Calendar], ["milestones", "Recent Progress", Sparkles]].map(([k, l, Icon]) => (
              <button key={k} onClick={() => setProducerTab(k)} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "10px 16px", background: producerTab === k ? CREAM_2 : "transparent", border: "none", fontSize: 12.5, textAlign: "left" }}>
                <Icon size={14} /> {l}
              </button>
            ))}
            <div style={{ marginTop: "auto", padding: 16, borderTop: `1px solid ${LINE}` }}>
              <p style={{ fontSize: 10.5, color: MUTE, marginBottom: 6, wordBreak: "break-all" }}>{session.user.email}</p>
              <button onClick={() => supabase.auth.signOut()} style={{ fontSize: 11.5, color: CLAY, background: "none", border: "none", textDecoration: "underline", padding: 0 }}>Sign out</button>
            </div>
          </div>
          <div style={{ flex: 1, overflowY: "auto" }}>
            {producerTab === "home" && <ProducerHome data={data} setTab={setProducerTab} update={update} />}
            {producerTab === "episodes" && <ProducerEpisodes data={data} update={update} selected={producerEpSel || data.episodes[0].id} setSelected={setProducerEpSel} />}
            {producerTab === "interviews" && <ProducerInterviews data={data} update={update} />}
            {producerTab === "days" && <ProducerDays data={data} update={update} />}
            {producerTab === "milestones" && <ProducerMilestones data={data} update={update} />}
          </div>
        </div>
      )}
    </div>
  );
}
