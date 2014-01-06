var _ = require('underscore'),
	Task = require('./lib/Task'),
	Job = require('./lib/Job'),
	Vm = require('./lib/Vm'),
	Host = require('./lib/Host');

var h1 = new Host({
	mips: 5000
});
var vm1 = new Vm({
	mips: 2000
});

var vm2 = new Vm({
	mips: 500
});

var t1 = new Task({
	computeSize: 3000
});

var t2 = new Task({
	computeSize: 5000
});

var j1 = new Job({
	task: t1,
	vm: vm1
});

var j2 = new Job({
	task: t1,
	vm: _.clone(j1.vm)
});


var j3 = new Job({
	task: t1,
	vm: _.clone(j1.vm)
});

var j4 = new Job({
	task: t2,
	vm: vm2
});

var jobs = [j1, j2, j3, j4];
var jobs2 = [j1, j2, j4, j3];

var jobList = new JobList(jobs);

// h1.startExcuteJobs(jobs2);

