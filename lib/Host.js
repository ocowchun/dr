var _ = require('underscore'),
	JobList = require('./JobList'),
	Event = require('./Event');

module.exports = Host = function Host(argument) {
	this.mips = arguments.mips;
	this.usedMips = 0;
	this.freeMips = argument.mips;
	this.vmList = [];
	this.futureQueue = [];
	this.deferedQueue = [];
	this.jobList;
	this.currentTime = 0;
}


Host.prototype.addVm = function(vm) {
	if (this.freeMips > vm.mips) {
		this.vmList.push(vm);
		this.occupyMips(vm.mips);
		return true;
	}
	return false;
};

Host.prototype.removeVm = function(vm) {
	var index = this.vmList.indexOf(vm)

	if (index > -1) {
		this.vmList.splice(index, 1);
		this.releaseMips(vm.mips);
		return true;
	}
	return false;
};



Host.prototype.occupyMips = function occupyMips(mips) {
	if (this.freeMips > mips) {
		this.usedMips = this.usedMips + mips;
		this.freeMips = this.freeMips - mips;
	}
}

Host.prototype.releaseMips = function(mips) {
	this.usedMips = this.usedMips - mips;
	this.freeMips = this.freeMips + mips;
};

Host.prototype.createEvent = function createEvent(eventType, time, data) {
	data = data || {}
	return new Event({
		startTime: this.currentTime + time,
		data: data,
		eventType: eventType
	});
}



Host.prototype.excuteJob = function() {

	var job = this.jobList.next();
	if (_.isUndefined(job)) {
		return false;
	}
	var task = job.task,
		vm = job.vm;
	if (this.addVm(vm)) {
		// console.log("job id:" + job.id);
		var completeTime = task.computeSize / vm.mips;
		var e = this.createEvent("completeJob", completeTime, {
			jobId: job.id
		});
		this.jobList.moveJobToDoing(job.id);
		this.futureQueue.push(e);
		this.excuteJobRequest();
		return true;
	}
	return false;
}

Host.prototype.excuteJobs = function() {
	var isContinue = true,
		max = this.jobList.length(),
		i = 0;
	while (isContinue && i < max) {
		isContinue = this.excuteJob(this.jobList.getJob(i));
		i++;
	}
}

Host.prototype.findNearestEvent = function findNearestEvent() {
	var currentTime = this.currentTime,
		firstEvent, delay = Number.MAX_VALUE;
	_.each(this.futureQueue, function(e) {
		var eventDelay = Math.abs(currentTime - e.startTime);
		if (eventDelay < delay) {
			firstEvent = e;
			delay = eventDelay;
		}
	});
	return firstEvent;
};


Host.prototype.pushToDefered = function pushToDefered() {

	// var currentTime = this.currentTime,
	// 	firstEvent = _.find(this.futureQueue, function(e) {
	// 		return e.startTime == currentTime;
	// 	}) || this.futureQueue[0];
	var firstEvent = this.findNearestEvent();

	this.currentTime = firstEvent.startTime;


	this.deferedQueue = _.filter(this.futureQueue,
		function(e) {
			return e.startTime == firstEvent.startTime;
		});
	this.futureQueue = _.filter(this.futureQueue, function(e) {
		return e.startTime != firstEvent.startTime;
	});
}

Host.prototype.excuteDefered = function excuteDefered() {
	// console.log(this.deferedQueue[0].startTime);
	// console.log("event:" + this.deferedQueue.length);
	var that = this;
	_.each(this.deferedQueue, function(e) {
		that.excuteEvent(e)
	});
}

Host.prototype.excuteEvent = function excuteEvent(e) {
	var data = e.data,
		eventType = e.eventType;
	// console.log("excuteEvent:" + eventType);
	this[eventType](data);
}

Host.prototype.startExcuteJobs = function excuteJobs(jobs) {
	var completeJobs = [];
	this.jobList = new JobList(jobs);
	this.currentTime = 0;

	var e = this.createEvent("excuteJob", this.currentTime);
	this.futureQueue.push(e);

	var a = 0;
	console.log(this.futureQueue.length)
	while (this.futureQueue.length > 0 && a < 15) {
		this.pushToDefered();
		console.log();
		console.log("===currentTime:" + this.currentTime + "===");
		// console.log(this.futureQueue);
		// console.log(this.findNearestEvent());
		this.excuteDefered();


		a++;
	}
	console.log("===currentTime:" + this.currentTime + "===");
	return this.currentTime;
}


Host.prototype.completeJob = function(argument) {
	// console.log("completeJob:" + argument.jobId);
	var job = this.jobList.findDoingJob(argument.jobId),
		vm = job.vm;
	this.removeVm(vm);

	if (this.isAllJobDone()) {
		// console.log("no more job in todo!");
	} else {
		this.excuteJobRequest();
		// console.log("not yet");

	}

};

Host.prototype.excuteJobRequest = function() {
	var e = this.createEvent("excuteJob", 0);
	// console.log("excuteJobRequest at:"+);
	this.futureQueue.push(e);
}

Host.prototype.isAllJobDone = function() {
	return this.jobList.length() == 0;
}