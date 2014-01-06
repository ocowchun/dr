module.exports = Event = function Event(argument) {
	this.startTime = argument.startTime;
	this.data = argument.data;
	this.eventType = argument.eventType;
}