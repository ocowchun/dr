module.exports = JobList = function JobList(jobs) {
	this.jobList = jobs;
	this.doing = [];
	this.done = [];
	for (var i = 0, max = this.jobList.length; i < max; i++) {
		var job = this.jobList[i];
		job.id = i;

	}
}

JobList.prototype.next = function() {
	if (this.jobList.length > 0) {
		return this.jobList[0];

	} else {
		return undefined;
	}
}

JobList.prototype.removeJob = function(id) {
	var index = this.findJobIndex(id);
	this.jobList.splice(index, 1);
};

JobList.prototype.moveJobToDoing = function(id) {
	var job = this.findJob(id);
	this.removeJob(id);
	this.doing.push(job);
}

JobList.prototype.length = function() {
	return this.jobList.length;
}

JobList.prototype.findJobIndex = function findJobIndex(id) {
	for (var i = 0, max = this.jobList.length; i < max; i++) {
		var job = this.jobList[i];
		if (job.id == id) {
			return i;
		}
	}
}

JobList.prototype.findDoingJob = function findDoingJob(id) {
	return this.findJob(id, 'doing');
}


JobList.prototype.findJob = function findJob(id, list) {
	var jobList = this.jobList;
	if (list == 'doing') {
		jobList = this.doing;
	} else if (list == 'done') {
		jobList = this.done;
	}

	for (var i = 0, max = jobList.length; i < max; i++) {
		var job = jobList[i];
		if (job.id == id) {
			return job;
		}
	}
}



JobList.prototype.getJob = function(index) {
	return this.jobList[index];
}