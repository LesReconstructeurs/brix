const Event = require('../../../domain/events/CampaignParticipationResultsShared');

class ScheduleParticipationResultCalculationJob {
  constructor({ participationResultCalculationJob }) {
    this.participationResultCalculationJob = participationResultCalculationJob;
  }

  async handle(event) {
    await this.participationResultCalculationJob.schedule(event);
  }

  get name() {
    return 'ScheduleParticipationResultCalculation';
  }
}

ScheduleParticipationResultCalculationJob.event = Event;

module.exports = ScheduleParticipationResultCalculationJob;
