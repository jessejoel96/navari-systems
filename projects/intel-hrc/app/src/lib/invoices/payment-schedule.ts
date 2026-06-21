/**
 * Payment schedule defaults and helpers.
 * Bank supplier payments: monthly on 15th (recurring) or user-set.
 * Maviance one-off: weekly on Friday (5) by default.
 */

export type PaymentSchedule = "weekly" | "monthly";

export const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function defaultPaymentSchedule(input: {
  payment_channel: string;
  is_recurring: boolean;
}): PaymentSchedule {
  if (input.payment_channel === "maviance" && !input.is_recurring) return "weekly";
  return "monthly";
}

export function defaultScheduledDay(input: {
  payment_channel: string;
  is_recurring: boolean;
}): number {
  if (input.payment_channel === "bank") return 15;
  return 1;
}

export function defaultScheduledWeekday(input: {
  payment_channel: string;
  is_recurring: boolean;
  payment_schedule?: PaymentSchedule;
}): number | null {
  const schedule = input.payment_schedule ?? defaultPaymentSchedule(input);
  if (schedule === "weekly") {
    if (input.payment_channel === "maviance") return 5;
    return 5;
  }
  return null;
}

export function paymentScheduleLabel(invoice: {
  payment_schedule?: string | null;
  payment_channel?: string | null;
  scheduled_payment_day?: number | null;
  scheduled_payment_weekday?: number | null;
  is_recurring?: boolean | null;
}): string {
  const schedule = (invoice.payment_schedule ?? "monthly") as PaymentSchedule;
  if (schedule === "weekly") {
    const wd = invoice.scheduled_payment_weekday ?? 5;
    return `Weekly · ${WEEKDAY_LABELS[wd] ?? "Fri"}`;
  }
  const day = invoice.scheduled_payment_day ?? (invoice.payment_channel === "bank" ? 15 : 1);
  return `Monthly · day ${day}`;
}

/** Whether invoice falls in the selected payment period for sheet generation. */
export function invoiceInPaymentPeriod(
  invoice: {
    invoice_date?: string | null;
    payment_schedule?: string | null;
    scheduled_payment_day?: number | null;
    scheduled_payment_weekday?: number | null;
    payment_channel?: string | null;
    is_recurring?: boolean | null;
  },
  period: { month: number; year: number; weekOfMonth?: number }
): boolean {
  if (!invoice.invoice_date) return false;
  const d = new Date(invoice.invoice_date);
  if (d.getFullYear() !== period.year || d.getMonth() + 1 !== period.month) {
    // Recurring bank items may still pay in period even if invoice date differs
    if (!invoice.is_recurring) return false;
  }

  const schedule = (invoice.payment_schedule ?? defaultPaymentSchedule({
    payment_channel: invoice.payment_channel ?? "bank",
    is_recurring: Boolean(invoice.is_recurring),
  })) as PaymentSchedule;

  if (schedule === "monthly") return true;

  // Weekly: include if invoice date's weekday matches scheduled weekday
  const targetWd = invoice.scheduled_payment_weekday ?? defaultScheduledWeekday({
    payment_channel: invoice.payment_channel ?? "maviance",
    is_recurring: Boolean(invoice.is_recurring),
  }) ?? 5;

  return d.getDay() === targetWd || Boolean(invoice.is_recurring);
}

export function applyPaymentDefaults<T extends Record<string, unknown>>(body: T): T & {
  payment_schedule: PaymentSchedule;
  scheduled_payment_day: number;
  scheduled_payment_weekday: number | null;
} {
  const channel = String(body.payment_channel ?? "bank");
  const recurring = Boolean(body.is_recurring);
  const schedule = (body.payment_schedule as PaymentSchedule) || defaultPaymentSchedule({
    payment_channel: channel,
    is_recurring: recurring,
  });

  return {
    ...body,
    payment_schedule: schedule,
    scheduled_payment_day: Number(body.scheduled_payment_day) || defaultScheduledDay({
      payment_channel: channel,
      is_recurring: recurring,
    }),
    scheduled_payment_weekday:
      body.scheduled_payment_weekday != null
        ? Number(body.scheduled_payment_weekday)
        : schedule === "weekly"
          ? defaultScheduledWeekday({ payment_channel: channel, is_recurring: recurring })
          : null,
  };
}
