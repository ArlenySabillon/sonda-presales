﻿class Tarea {
  taskId: number;
  expectedGps: string;
  postedGps: string;
  taskComments: string;
  taskAddress: string;
  relatedClientPhone1: string;
  emailToConfirm: string;
  relatedClientCode: string;
  relatedClientName: string;
  taskPriority: number;
  taskStatus: string;
  taskType: string;
  salesOrderType: string;
  hasDraft: boolean = false;
  salesOrderIdDraft: number;
  salesOrderDocSerieDraft: string;
  salesOrderDocNumDraft: number;
  completedSuccessfully: boolean;
  taskOffPlan: number;
  reason: string;
  taskBoId: number;
  salesOrderTotal: number = 0;
  discountPerGeneralAmount: number = 0;
  discountPerGeneralAmountLowLimit: number = -1;
  discountPerGeneralAmountHighLimit: number = -1;
  taskIsFrom: string = "";
  isPostedOffLine: number = 0;
  deviceNetworkType: string = "";
  microsurveys: Microencuesta[] = [];
}