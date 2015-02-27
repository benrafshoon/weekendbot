var schedule = require("node-schedule");

var rule = new schedule.RecurrenceRule();
rule.second = [new schedule.Range(0, 60)];

console.log("test");
schedule.scheduleJob(rule, function() {
  console.log(new Date());
});
