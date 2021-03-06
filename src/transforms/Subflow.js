import Operator from '../Operator';
import {inherits} from 'vega-util';

/**
 * Provides a bridge between a parent transform and a target subflow that
 * consumes only a subset of the tuples that pass through the parent.
 * @constructor
 * @param {Pulse} pulse - A pulse to use as the value of this operator.
 * @param {Transform} parent - The parent transform (typically a Facet instance).
 * @param {Transform} target - A transform that receives the subflow of tuples.
 */
export default function Subflow(pulse, parent) {
  Operator.call(this, pulse);
  this.parent = parent;
}

var prototype = inherits(Subflow, Operator);

prototype.connect = function(target) {
  this.targets().add(target);
  return (target.source = this);
};

/**
 * Add an 'add' tuple to the subflow pulse.
 * @param {Tuple} t - The tuple being added.
 */
prototype.add = function(t) {
  this.value.add.push(t);
};

/**
 * Add a 'rem' tuple to the subflow pulse.
 * @param {Tuple} t - The tuple being removed.
 */
prototype.rem = function(t) {
  this.value.rem.push(t);
};

/**
 * Add a 'mod' tuple to the subflow pulse.
 * @param {Tuple} t - The tuple being modified.
 */
prototype.mod = function(t) {
  this.value.mod.push(t);
};

/**
 * Re-initialize this operator's pulse value.
 * @param {Pulse} pulse - The pulse to copy from.
 * @see Pulse.init
 */
prototype.init = function(pulse) {
  this.value.init(pulse);
};

/**
 * Evaluate this operator. This method overrides the
 * default behavior to simply return the contained pulse value.
 * @return {Pulse}
 */
prototype.evaluate = function() {
  // assert: this.value.stamp === pulse.stamp
  return this.value;
};
