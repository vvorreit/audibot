// auth
export { checkAdmin } from "./auth";

// users — read
export {
  getAdminAnalytics,
  getAllUsersAdmin,
  getAllTeamsAdmin,
  getUserDetail,
} from "./users-read";

// users — write
export {
  setUserPlan,
  toggleUserAdminRole,
  toggleUserProStatus,
  grantFreeMonths,
  revokeFreeMonths,
  deleteUserAdmin,
  banUserAdmin,
  unbanUserAdmin,
  purgeOrphanTeams,
  assignUserToTeam,
  removeUserFromTeam,
} from "./users-write";

// ocr
export { getOcrUsers, getOcrAnalytics } from "./ocr";

// franchise
export {
  getFranchiseLeads,
  updateFranchiseLeadStatus,
  getFranchiseAlerts,
} from "./franchise";

// extension
export {
  getExtensionUsageStats,
  getInjectionByMode,
  getUserInjectionHistory,
} from "./extension";

// kpis
export {
  getFunnelMetrics,
  getTimeToValueMetrics,
  getEngagementMetrics,
  getFeatureAdoptionMetrics,
  getNpsMetrics,
  getExpansionMetrics,
} from "./kpis";

// bilan
export { getBilanUsers, getAdminBilanDashboard } from "./bilan";
