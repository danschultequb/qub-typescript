import * as fs from "fs";
import * as path from "path";

/**
 * The interface that is expected by Javascript/Typescript to create a for...of loop.
 */
export interface JavascriptIteratorResult<T> {
    done: boolean;
    value: T;
}

/**
 * An adapter between an Iterator and an iterator that Javascript/Typescript expects.
 */
export class JavascriptIterator<T> {
    constructor(private _iterator: Iterator<T>) {
    }

    /**
     * Get the next value in the Iterator.
     */
    public next(): JavascriptIteratorResult<T> {
        let done: boolean;
        if (!this._iterator.hasStarted()) {
            done = !this._iterator.next();
        }
        else {
            done = !this._iterator.hasCurrent();
        }

        const result: JavascriptIteratorResult<T> = {
            done: done,
            value: this._iterator.getCurrent()
        };
        
        if (!done) {
            this._iterator.next();
        }

        return result;
    }
}

/**
 * An interface that iterates over a collection of values.
 */
export interface Iterator<T> {
    /**
     * The iterator function that gets called when this object is passed into a for-of loop.
     */
    [Symbol.iterator](): JavascriptIterator<T>

    /**
     * Whether or not this Iterator has stated iterating.
     */
    hasStarted(): boolean;

    /**
     * Whether or not this Iterator is currently pointing at a value or not. The Iterator could not
     * be pointing at a value if it hasn't started iterating, or if it has finished iterating.
     */
    hasCurrent(): boolean;

    /**
     * Move this Iterator to the next value in the collection. Return whether or not this Iterator
     * has a current value when it is finished moving.
     */
    next(): boolean;

    /**
     * Get the current value that this Iterator is pointing at, or get undefined if the Iterator
     * doesn't have a current value.
     */
    getCurrent(): T;

    /**
     * Get the current value and move this iterator to the next value in the collection.
     */
    takeCurrent(): T;

    /**
     * Get whether or not this Iterator contains any values that match the provided condition. If
     * the condition is not defined, then this function returns whether the collection contains any
     * values. This function may advance the iterator.
     */
    any(condition?: (value: T) => boolean): boolean;

    /**
     * Get the number of values that this Iterator can iterate. The Iterator will not have a current
     * value when this function completes.
     */
    getCount(): number;

    /**
     * Get the first value in this Iterator that matches the provided condition. If no condition
     * is provided, then the first value in the Iterator will be returned. If the Iterator is empty,
     * then undefined will be returned.
     */
    first(condition?: (value: T) => boolean): T;

    /**
     * Get the last value in this Iterator. If the Iterator is empty or has no values that match the
     * provided condition, then undefined will be returned.
     */
    last(condition?: (value: T) => boolean): T;

    /**
     * Place each of the values of this Iterator into an array.
     */
    toArray(): T[];

    /**
     * Place each of the values of this Iterator into an ArrayList.
     */
    toArrayList(): ArrayList<T>;

    /**
     * Get an Iterator based on this Iterator that only returns values that match the provided
     * condition.
     */
    where(condition: (value: T) => boolean): Iterator<T>;

    /**
     * Get an Iterator based on this Iterator that skips the provided number of values.
     */
    skip(toSkip: number): Iterator<T>;

    /**
     * Get an Iterator based on this Iterator that only returns the provided number of values.
     */
    take(toTake: number): Iterator<T>;

    /**
     * Get an Iterator based on this Iterator that maps each of this Iterator's values to a
     * different value.
     */
    map<U>(mapFunction: (value: T) => U): Iterator<U>;

    /**
     * Return a new iterator that concatenates the contents of the provided iterator to the contents
     * of this iterator.
     */
    concatenate(iterator: Iterator<T> | T[]): Iterator<T>;

    /**
     * Get the minimum value in this Iterator based on the provided comparison function.
     * @param lessThanComparison A comparison function that returns whether or not lhs is less than
     *      rhs. If no comparison function is provided, defaults to standard less than comparison.
     */
    minimum(lessThanComparison?: (lhs: T, rhs: T) => boolean): T;

    /**
     * Get the maximum value in this Iterator based on the provided comparison function.
     * @param greaterThanComparison A comparison function that returns whether or not lhs is greater
     *      than rhs. If no comparison function is provided, defaults to standard greater than
     *      comparison.
     */
    maximum(greaterThanComparison?: (lhs: T, rhs: T) => boolean): T;
}

/**
 * The base class for Iterator implementations. This class provides many of the common
 * implementations for Iterator methods.
 */
export abstract class IteratorBase<T> implements Iterator<T> {
    public abstract hasStarted(): boolean;
    public abstract hasCurrent(): boolean;
    public abstract next(): boolean;
    public abstract getCurrent(): T;

    [Symbol.iterator](): JavascriptIterator<T> {
        return new JavascriptIterator<T>(this);
    }

    public takeCurrent(): T {
        const result: T = this.getCurrent();
        this.next();
        return result;
    }

    public getCount(): number {
        let result: number = 0;

        if (this.hasCurrent()) {
            ++result;
        }

        while (this.next()) {
            ++result;
        }

        return result;
    }

    public any(condition?: (value: T) => boolean): boolean {
        let result: boolean;

        if (!condition) {
            result = this.hasCurrent() || this.next();
        }
        else {
            result = false;
            for (const value of this) {
                if (condition(value)) {
                    result = true;
                    break;
                }
            }
        }

        return result;
    }

    public first(condition?: (value: T) => boolean): T {
        let result: T;
        if (!condition) {
            if (!this.hasStarted()) {
                this.next();
            }
            result = this.getCurrent();
        }
        else {
            result = this.where(condition).first();
        }
        return result;
    }

    public last(condition?: (value: T) => boolean): T {
        let result: T;
        if (!condition) {
            if (!this.hasStarted()) {
                this.next();
            }

            if (this.hasCurrent()) {
                result = this.getCurrent();
            }

            while (this.next()) {
                result = this.getCurrent();
            }
        }
        else {
            result = this.where(condition).last();
        }
        return result;
    }

    public toArray(): T[] {
        const result: T[] = [];
        for (const value of this) {
            result.push(value);
        }
        return result;
    }

    public toArrayList(): ArrayList<T> {
        return new ArrayList(this.toArray());
    }

    public where(condition: (value: T) => boolean): Iterator<T> {
        return new WhereIterator(this, condition);
    }

    public skip(toSkip: number): Iterator<T> {
        return new SkipIterator(this, toSkip);
    }

    public take(toTake: number): Iterator<T> {
        return new TakeIterator(this, toTake);
    }

    public map<U>(mapFunction: (value: T) => U): Iterator<U> {
        return new MapIterator<U, T>(this, mapFunction);
    }

    public concatenate(toConcatenate: Iterator<T> | T[]): Iterator<T> {
        let result: Iterator<T>;
        if (!toConcatenate) {
            result = this;
        }
        else {
            if (toConcatenate instanceof Array) {
                toConcatenate = new ArrayList<T>(toConcatenate).iterate();
            }
            result = new ConcatenateIterator<T>(this, toConcatenate);
        }
        return result;
    }

    public minimum(lessThanComparison?: (lhs: T, rhs: T) => boolean): T {
        let result: T;

        if (!lessThanComparison) {
            lessThanComparison = (lhs: T, rhs: T) => lhs < rhs;
        }

        if (!this.hasStarted()) {
            this.next();
        }

        if (this.hasCurrent()) {
            result = this.getCurrent();

            while (this.next()) {
                if (lessThanComparison(this.getCurrent(), result)) {
                    result = this.getCurrent();
                }
            }
        }

        return result;
    }

    public maximum(greaterThanComparison?: (lhs: T, rhs: T) => boolean): T {
        let result: T;

        if (!greaterThanComparison) {
            greaterThanComparison = (lhs: T, rhs: T) => lhs > rhs;
        }

        if (!this.hasStarted()) {
            this.next();
        }

        if (this.hasCurrent()) {
            result = this.getCurrent();

            while (this.next()) {
                if (greaterThanComparison(this.getCurrent(), result)) {
                    result = this.getCurrent();
                }
            }
        }

        return result;
    }
}

/**
 * A decorator base-class for Iterators.
 */
abstract class IteratorDecorator<T> extends IteratorBase<T> {
    constructor(private _innerIterator: Iterator<T>) {
        super();
    }

    public hasStarted(): boolean {
        return this._innerIterator.hasStarted();
    }

    public hasCurrent(): boolean {
        return this._innerIterator.hasCurrent();
    }

    public next(): boolean {
        return this._innerIterator.next();
    }

    public getCurrent(): T {
        return this._innerIterator.getCurrent();
    }
}

/**
 * An Iterator that only returns values from the inner iterator that match its condition.
 */
class WhereIterator<T> extends IteratorDecorator<T> {
    constructor(innerIterator: Iterator<T>, private _condition: (value: T) => boolean) {
        super(innerIterator);

        if (this._condition) {
            while (this.hasCurrent() && !this._condition(this.getCurrent())) {
                super.next();
            }
        }
    }

    public next(): boolean {
        if (!this._condition) {
            super.next();
        }
        else {
            while (super.next() && !this._condition(this.getCurrent())) {
            }
        }

        return this.hasCurrent();
    }
}

/**
 * An Iterator that skips the first number of values from the provided inner iterator.
 */
class SkipIterator<T> extends IteratorDecorator<T> {
    private _skipped: number = 0;

    constructor(innerIterator: Iterator<T>, private _toSkip: number) {
        super(innerIterator);
    }

    private skipValues(): void {
        while (this._skipped < this._toSkip) {
            if (!super.next()) {
                this._skipped = this._toSkip;
            }
            else {
                ++this._skipped;
            }
        }
    }

    public hasCurrent(): boolean {
        if (super.hasCurrent()) {
            this.skipValues();
        }
        return super.hasCurrent();
    }

    public next(): boolean {
        this.skipValues();
        return super.next();
    }

    public getCurrent(): T {
        if (super.hasCurrent()) {
            this.skipValues();
        }
        return super.getCurrent();
    }
}

/**
 * An Iterator that only takes at most the first number of values from the provided inner iterator.
 */
class TakeIterator<T> extends IteratorDecorator<T> {
    private _taken: number;

    constructor(innerIterator: Iterator<T>, private _toTake: number) {
        super(innerIterator);

        this._taken = super.hasCurrent() ? 1 : 0;
    }

    private canTakeValue(): boolean {
        return isDefined(this._toTake) && this._taken <= this._toTake;
    }

    public hasCurrent(): boolean {
        return super.hasCurrent() && this.canTakeValue();
    }

    public next(): boolean {
        if (this.canTakeValue()) {
            ++this._taken;
            super.next();
        }
        return this.hasCurrent();
    }

    public getCurrent(): T {
        return this.hasCurrent() ? super.getCurrent() : undefined;
    }
}

class MapIterator<OuterT, InnerT> implements Iterator<OuterT> {
    private _started: boolean;

    constructor(private _innerIterator: Iterator<InnerT>, private _mapFunction: (value: InnerT) => OuterT) {
        this._started = _innerIterator.hasStarted();
    }

    [Symbol.iterator](): JavascriptIterator<OuterT> {
        return new JavascriptIterator<OuterT>(this);
    }

    public hasStarted(): boolean {
        return this._started;
    }

    public hasCurrent(): boolean {
        return this._mapFunction ? this._innerIterator.hasCurrent() : false;
    }

    public next(): boolean {
        this._started = true;
        return isDefined(this._mapFunction) && this._innerIterator.next();
    }

    public takeCurrent(): OuterT {
        const result: OuterT = this.getCurrent();
        this.next();
        return result;
    }

    public getCurrent(): OuterT {
        return this.hasCurrent() ? this._mapFunction(this._innerIterator.getCurrent()) : undefined;
    }

    public any(condition?: (value: OuterT) => boolean): boolean {
        let result: boolean;

        if (!condition) {
            result = this.hasCurrent() || this.next();
        }
        else {
            result = false;
            for (const value of this) {
                if (condition(value)) {
                    result = true;
                    break;
                }
            }
        }

        return result;
    }

    public getCount(): number {
        this._started = true;
        return isDefined(this._mapFunction) ? this._innerIterator.getCount() : 0;
    }

    public first(condition?: (value: OuterT) => boolean): OuterT {
        return this.where(condition).first();
    }

    public last(condition?: (value: OuterT) => boolean): OuterT {
        return this.where(condition).last();
    }

    public toArray(): OuterT[] {
        const result: OuterT[] = [];
        for (const value of this) {
            result.push(value);
        }
        return result;
    }

    public toArrayList(): ArrayList<OuterT> {
        return new ArrayList(this.toArray());
    }

    public where(condition: (value: OuterT) => boolean): Iterator<OuterT> {
        return new WhereIterator(this, condition);
    }

    public skip(toSkip: number): Iterator<OuterT> {
        return new SkipIterator(this, toSkip);
    }

    public take(toTake: number): Iterator<OuterT> {
        return new TakeIterator(this, toTake);
    }

    public map<NewT>(mapFunction: (value: OuterT) => NewT): Iterator<NewT> {
        return new MapIterator(this, mapFunction);
    }

    public concatenate(toConcatenate: Iterator<OuterT>): Iterator<OuterT> {
        return new ConcatenateIterator<OuterT>(this, toConcatenate);
    }

    public minimum(lessThanComparison?: (lhs: OuterT, rhs: OuterT) => boolean): OuterT {
        let result: OuterT;

        if (!lessThanComparison) {
            lessThanComparison = (lhs: OuterT, rhs: OuterT) => lhs < rhs;
        }

        if (!this.hasStarted()) {
            this.next();
        }

        if (this.hasCurrent()) {
            result = this.getCurrent();

            while (this.next()) {
                if (lessThanComparison(this.getCurrent(), result)) {
                    result = this.getCurrent();
                }
            }
        }

        return result;
    }

    public maximum(greaterThanComparison: (lhs: OuterT, rhs: OuterT) => boolean): OuterT {
        let result: OuterT;

        if (!greaterThanComparison) {
            greaterThanComparison = (lhs: OuterT, rhs: OuterT) => lhs > rhs;
        }

        if (!this.hasStarted()) {
            this.next();
        }

        if (this.hasCurrent()) {
            result = this.getCurrent();

            while (this.next()) {
                if (greaterThanComparison(this.getCurrent(), result)) {
                    result = this.getCurrent();
                }
            }
        }

        return result;
    }
}

class ConcatenateIterator<T> extends IteratorBase<T> {
    public constructor(private _first: Iterator<T>, private _second: Iterator<T>) {
        super();
    }

    public hasStarted(): boolean {
        return this._first.hasStarted();
    }

    public hasCurrent(): boolean {
        return this._first.hasCurrent() || this._second.hasCurrent();
    }

    public next(): boolean {
        return this._first.next() || this._second.next();
    }

    public getCurrent(): T {
        return this._first.hasCurrent() ? this._first.getCurrent() : this._second.getCurrent();
    }
}

/**
 * An interface of a collection that can have its contents iterated through.
 */
export interface Iterable<T> {
    [Symbol.iterator](): JavascriptIterator<T>;

    /**
     * Create an iterator for this collection.
     */
    iterate(): Iterator<T>;

    /**
     * Get whether or not this collection contains any values that match the provided condition. If
     * the condition is not defined, then this function returns whether the collection contains any
     * values.
     */
    any(condition?: (value: T) => boolean): boolean;

    /**
     * Get the number of values that are contained in this collection.
     */
    getCount(): number;

    /**
     * Get whether or not this Iterable contians the provided value using the provided comparison
     * function. If no comparison function is provided, then a simple '===' comparison will be used.
     */
    contains(value: T, comparison?: (lhs: T, rhs: T) => boolean): boolean;

    /**
     * Get the first value in this collection that matches the provided condition. If no condition
     * is provided, then the first value in the collection will be returned. If the collection is
     * empty, then undefined will be returned.
     */
    first(condition?: (value: T) => boolean): T;

    /**
     * Get the last value in this collection. If the collection is empty, then undefined will be
     * returned.
     */
    last(condition?: (value: T) => boolean): T;

    /**
     * Get the values of this Iterable that match the provided condition.
     */
    where(condition: (value: T) => boolean): Iterable<T>;

    /**
     * Get an Iterable that skips the first toSkip number of values from this Iterable.
     */
    skip(toSkip: number): Iterable<T>;

    /**
     * Get an Iterable that skips the last toSkip number of values from this Iterable.
     */
    skipLast(toSkip: number): Iterable<T>;

    /**
     * Get the first toTake number of values from this Iterable<T>.
     */
    take(toTake: number): Iterable<T>;

    /**
     * Get the last toTake number of values from this Iterable<T>.
     */
    takeLast(toTake: number): Iterable<T>;

    /**
     * Get an Iterable based on this Iterable that maps each of this Iterable's values to a
     * different value.
     */
    map<U>(mapFunction: (value: T) => U): Iterable<U>;

    /**
     * Get an Iterable that concatenates the values of this Iterable with the values of the provided
     * Iterable or Array.
     */
    concatenate(toConcatenate: Iterable<T> | T[]): Iterable<T>;

    /**
     * Convert the values of this Iterable into an array.
     */
    toArray(): T[];

    /**
     * Get whether or not this Iterable<T> ends with the provided values.
     */
    endsWith(values: Iterable<T>): boolean;

    /**
     * Get the minimum value in this Iterable based on the provided comparison function.
     * @param lessThanComparison A comparison function that returns whether or not lhs is less than
     *      rhs. If no comparison function is provided, defaults to standard less than comparison.
     */
    minimum(lessThanComparison?: (lhs: T, rhs: T) => boolean): T;

    /**
     * Get the maximum value in this Iterable based on the provided comparison function.
     * @param greaterThanComparison A comparison function that returns whether or not lhs is greater
     *      than rhs. If no comparison function is provided, defaults to standard greater than
     *      comparison.
     */
    maximum(greaterThanComparison?: (lhs: T, rhs: T) => boolean): T;
}

/**
 * A base implementation of the Iterable<T> interface that classes can extend to make implementing
 * Iterable<T> easier.
 */
export abstract class IterableBase<T> implements Iterable<T> {
    [Symbol.iterator](): JavascriptIterator<T> {
        return new JavascriptIterator<T>(this.iterate());
    }

    public abstract iterate(): Iterator<T>;

    public any(condition?: (value: T) => boolean): boolean {
        return this.iterate().any(condition);
    }

    public getCount(): number {
        return this.iterate().getCount();
    }

    public contains(value: T, comparison?: (iterableValue: T, value: T) => boolean): boolean {
        if (!comparison) {
            comparison = (iterableValue: T, value: T) => iterableValue === value;
        }

        return this.any((iterableValue: T) => comparison(iterableValue, value));
    }

    public first(condition?: (value: T) => boolean): T {
        return this.iterate().first(condition);
    }

    public last(condition?: (value: T) => boolean): T {
        return this.iterate().last(condition);
    }

    public where(condition: (value: T) => boolean): Iterable<T> {
        return condition ? new WhereIterable<T>(this, condition) : this;
    }

    public skip(toSkip: number): Iterable<T> {
        return toSkip && 0 < toSkip ? new SkipIterable(this, toSkip) : this;
    }

    public skipLast(toSkip: number): Iterable<T> {
        return toSkip && 0 < toSkip ? this.take(this.getCount() - toSkip) : this;
    }

    public take(toTake: number): Iterable<T> {
        return toTake && 0 < toTake ? new TakeIterable(this, toTake) : new ArrayList<T>();
    }

    public takeLast(toTake: number): Iterable<T> {
        let result: Iterable<T>;
        if (!toTake || toTake < 0) {
            result = new ArrayList<T>();
        }
        else {
            const count: number = this.getCount();
            if (count <= toTake) {
                result = this;
            }
            else {
                result = this.skip(count - toTake);
            }
        }
        return result;
    }

    public map<U>(mapFunction: (value: T) => U): Iterable<U> {
        return mapFunction ? new MapIterable(this, mapFunction) : new ArrayList<U>();
    }

    public concatenate(toConcatenate: Iterable<T> | T[]): Iterable<T> {
        return toConcatenate ? new ConcatenateIterable(this, toConcatenate) : this;
    }

    public toArray(): T[] {
        return this.iterate().toArray();
    }

    public endsWith(values: Iterable<T>): boolean {
        let result: boolean;

        if (!values) {
            result = false;
        }
        else {
            const valuesCount: number = values.getCount();
            if (valuesCount === 0) {
                result = false;
            }
            else if (this.getCount() < valuesCount) {
                result = false;
            }
            else {
                result = true;

                const thisLastValuesIterator: Iterator<T> = this.takeLast(valuesCount).iterate();
                const valuesIterator: Iterator<T> = values.iterate();
                while (thisLastValuesIterator.next() === valuesIterator.next() && thisLastValuesIterator.hasCurrent()) {
                    if (thisLastValuesIterator.getCurrent() !== valuesIterator.getCurrent()) {
                        result = false;
                        break;
                    }
                }
            }
        }

        return result;
    }

    public minimum(lessThanComparison?: (lhs: T, rhs: T) => boolean): T {
        return this.iterate().minimum(lessThanComparison);
    }

    public maximum(greaterThanComparison?: (lhs: T, rhs: T) => boolean): T {
        return this.iterate().maximum(greaterThanComparison);
    }
}

class WhereIterable<T> extends IterableBase<T> {
    constructor(private _innerIterable: Iterable<T>, private _condition: (value: T) => boolean) {
        super();
    }

    public iterate(): Iterator<T> {
        return this._innerIterable.iterate().where(this._condition);
    }
}

function getCountWithSkip<T>(iterable: Iterable<T>, toSkip: number): number {
    let result: number = iterable.getCount();
    if (result <= toSkip) {
        result = 0;
    }
    else {
        result -= toSkip;
    }
    return result;
}

class SkipIterable<T> extends IterableBase<T> {
    constructor(private _innerIterable: Iterable<T>, private _toSkip: number) {
        super();
    }

    public iterate(): Iterator<T> {
        return this._innerIterable.iterate().skip(this._toSkip);
    }

    public getCount(): number {
        return getCountWithSkip(this._innerIterable, this._toSkip);
    }
}

function getCountWithTake<T>(iterable: Iterable<T>, toTake: number): number {
    let result: number = iterable.getCount();
    if (toTake < result) {
        result = toTake;
    }
    return result;
}

class TakeIterable<T> extends IterableBase<T> {
    constructor(private _innerIterable: Iterable<T>, private _toTake: number) {
        super();
    }

    public iterate(): Iterator<T> {
        return this._innerIterable.iterate().take(this._toTake);
    }

    public getCount(): number {
        return getCountWithTake(this._innerIterable, this._toTake);
    }
}

class MapIterable<OuterT, InnerT> implements Iterable<OuterT> {
    constructor(private _innerIterable: Iterable<InnerT>, private _mapFunction: (value: InnerT) => OuterT) {
    }

    [Symbol.iterator](): JavascriptIterator<OuterT> {
        return new JavascriptIterator<OuterT>(this.iterate());
    }

    public iterate(): Iterator<OuterT> {
        return this._innerIterable.iterate().map(this._mapFunction);
    }

    public any(condition?: (value: OuterT) => boolean): boolean {
        return this.iterate().any(condition);
    }

    public getCount(): number {
        return this._innerIterable.getCount();
    }

    public contains(value: OuterT, comparison?: (lhs: OuterT, rhs: OuterT) => boolean): boolean {
        if (!comparison) {
            comparison = (lhs: OuterT, rhs: OuterT) => lhs === rhs;
        }

        return this.any((iterableValue: OuterT) => comparison(iterableValue, value));
    }

    public first(condition?: (value: OuterT) => boolean): OuterT {
        return this.iterate().first(condition);
    }

    public last(condition?: (value: OuterT) => boolean): OuterT {
        return this.iterate().last(condition);
    }

    public where(condition: (value: OuterT) => boolean): Iterable<OuterT> {
        return condition ? new WhereIterable(this, condition) : this;
    }

    public skip(toSkip: number): Iterable<OuterT> {
        return toSkip && 0 < toSkip ? new SkipIterable(this, toSkip) : this;
    }

    public skipLast(toSkip: number): Iterable<OuterT> {
        return toSkip && 0 < toSkip ? this.take(this.getCount() - toSkip) : this;
    }

    public take(toTake: number): Iterable<OuterT> {
        return toTake && 0 < toTake ? new TakeIterable(this, toTake) : new ArrayList<OuterT>();
    }

    public takeLast(toTake: number): Iterable<OuterT> {
        let result: Iterable<OuterT>;
        if (!toTake || toTake < 0) {
            result = new ArrayList<OuterT>();
        }
        else {
            const count: number = this.getCount();
            if (count <= toTake) {
                result = this;
            }
            else {
                result = this.skip(count - toTake);
            }
        }
        return result;
    }

    public map<NewT>(mapFunction: (value: OuterT) => NewT): Iterable<NewT> {
        return mapFunction ? new MapIterable<NewT, OuterT>(this, mapFunction) : new ArrayList<NewT>();
    }

    public concatenate(toConcatenate: Iterable<OuterT> | OuterT[]): Iterable<OuterT> {
        return toConcatenate ? new ConcatenateIterable<OuterT>(this, toConcatenate) : this;
    }

    public toArray(): OuterT[] {
        return this.iterate().toArray();
    }

    public endsWith(values: Iterable<OuterT>): boolean {
        let result: boolean;

        if (!values) {
            result = false;
        }
        else {
            const valuesCount: number = values.getCount();
            if (valuesCount === 0) {
                result = false;
            }
            else if (this.getCount() < valuesCount) {
                result = false;
            }
            else {
                result = true;

                const thisLastValuesIterator: Iterator<OuterT> = this.takeLast(valuesCount).iterate();
                const valuesIterator: Iterator<OuterT> = values.iterate();
                while (thisLastValuesIterator.next() === valuesIterator.next() && thisLastValuesIterator.hasCurrent()) {
                    if (thisLastValuesIterator.getCurrent() !== valuesIterator.getCurrent()) {
                        result = false;
                        break;
                    }
                }
            }
        }

        return result;
    }

    public minimum(lessThanComparison?: (lhs: OuterT, rhs: OuterT) => boolean): OuterT {
        return this.iterate().minimum(lessThanComparison);
    }

    public maximum(greaterThanComparison?: (lhs: OuterT, rhs: OuterT) => boolean): OuterT {
        return this.iterate().maximum(greaterThanComparison);
    }
}

class ConcatenateIterable<T> extends IterableBase<T> {
    private _first: Iterable<T>;
    private _second: Iterable<T>;

    constructor(first: Iterable<T>, second: Iterable<T> | T[]) {
        super();
        this._first = first;
        this._second = new ArrayList<T>(second);
    }

    public iterate(): Iterator<T> {
        return this._first.iterate().concatenate(this._second.iterate());
    }
}

export interface Indexable<T> extends Iterable<T> {
    /**
     * Create an iterator for this collection that iterates the collection in reverse order.
     */
    iterateReverse(): Iterator<T>;

    /**
     * Get the value in this collection at the provided index. If the provided index is not defined
     * or is outside of this Indexable's bounds, then undefined will be returned.
     */
    get(index: number): T;

    /**
     * Get the value in this collection at the provided index from the end of the collection. If the
     * provided index is not defined or is outside of this Indexable's bounds, then undefined will
     * be returned.
     */
    getFromEnd(index: number): T;

    /**
     * Get an Indexable that skips the first toSkip number of values from this Indexable.
     */
    skip(toSkip: number): Indexable<T>;

    /**
     * Get an Indexable based on this Indexable that only returns the provided number of values.
     */
    take(toTake: number): Indexable<T>;

    /**
     * Get an Indexable based on this Indexable that maps each of this Indexable's values to a
     * different value.
     */
    map<U>(mapFunction: (value: T) => U): Indexable<U>;
}

export abstract class IndexableBase<T> extends IterableBase<T> implements Indexable<T> {
    public abstract iterateReverse(): Iterator<T>;

    public abstract get(index: number): T;

    public getFromEnd(index: number): T {
        return this.get(this.getCount() - 1 - index);
    }

    public indexOf(value: T, comparer?: (lhs: T, rhs: T) => boolean): number {
        if (!comparer) {
            comparer = (lhs: T, rhs: T) => lhs === rhs;
        }

        let result: number;

        let searchIndex: number = 0;
        for (const searchValue of this) {
            if (comparer(searchValue, value)) {
                result = searchIndex;
                break;
            }
            else {
                ++searchIndex;
            }
        }

        return result;
    }

    public skip(toSkip: number): Indexable<T> {
        return toSkip && 0 < toSkip ? new SkipIndexable<T>(this, toSkip) : this;
    }

    public take(toTake: number): Indexable<T> {
        let result: Indexable<T>;

        return toTake && 0 < toTake ? new TakeIndexable<T>(this, toTake) : new ArrayList<T>();
    }

    /**
     * Get an Indexable based on this Indexable that maps each of this Indexable's values to a
     * different value.
     */
    public map<NewT>(mapFunction: (value: T) => NewT): Indexable<NewT> {
        return mapFunction ? new MapIndexable<NewT,T>(this, mapFunction) : new ArrayList<NewT>();
    }
}

class SkipIndexable<T> extends IndexableBase<T> {
    constructor(private _innerIndexable: Indexable<T>, private _toSkip: number) {
        super();
    }

    public getCount(): number {
        return getCountWithSkip(this._innerIndexable, this._toSkip);
    }

    public iterate(): Iterator<T> {
        return this._innerIndexable.iterate().skip(this._toSkip);
    }

    public iterateReverse(): Iterator<T> {
        return this._innerIndexable.iterateReverse().take(this.getCount());
    }

    public get(index: number): T {
        return 0 <= index ? this._innerIndexable.get(this._toSkip + index) : undefined;
    }
}

class TakeIndexable<T> extends IndexableBase<T> {
    constructor(private _innerIndexable: Indexable<T>, private _toTake: number) {
        super();
    }

    public getCount(): number {
        return getCountWithTake(this._innerIndexable, this._toTake);
    }

    public iterate(): Iterator<T> {
        return this._innerIndexable.iterate().take(this._toTake);
    }

    public iterateReverse(): Iterator<T> {
        return this._innerIndexable.iterateReverse().skip(this._innerIndexable.getCount() - this.getCount());
    }

    public get(index: number): T {
        return 0 <= index && index < this.getCount() ? this._innerIndexable.get(index) : undefined;
    }
}

class MapIndexable<OuterT, InnerT> implements Indexable<OuterT> {
    constructor(private _innerIndexable: Indexable<InnerT>, private _mapFunction: (value: InnerT) => OuterT) {
    }

    [Symbol.iterator](): JavascriptIterator<OuterT> {
        return new JavascriptIterator<OuterT>(this.iterate());
    }

    public iterate(): Iterator<OuterT> {
        return this._innerIndexable.iterate().map(this._mapFunction);
    }

    public iterateReverse(): Iterator<OuterT> {
        return this._innerIndexable.iterateReverse().map(this._mapFunction);
    }

    public get(index: number): OuterT {
        return this._mapFunction(this._innerIndexable.get(index));
    }

    public getFromEnd(index: number): OuterT {
        return this._mapFunction(this._innerIndexable.getFromEnd(index));
    }

    public any(condition?: (value: OuterT) => boolean): boolean {
        return this.iterate().any(condition);
    }

    public getCount(): number {
        return this._innerIndexable.getCount();
    }

    public contains(value: OuterT, comparison?: (lhs: OuterT, rhs: OuterT) => boolean): boolean {
        if (!comparison) {
            comparison = (lhs: OuterT, rhs: OuterT) => lhs === rhs;
        }

        return this.any((iterableValue: OuterT) => comparison(iterableValue, value));
    }

    public first(condition?: (value: OuterT) => boolean): OuterT {
        return this.iterate().first(condition);
    }

    public last(condition?: (value: OuterT) => boolean): OuterT {
        return this.iterate().last(condition);
    }

    public where(condition: (value: OuterT) => boolean): Iterable<OuterT> {
        return condition ? new WhereIterable(this, condition) : this;
    }

    public skip(toSkip: number): Indexable<OuterT> {
        return toSkip && 0 < toSkip ? new SkipIndexable(this, toSkip) : this;
    }

    public skipLast(toSkip: number): Indexable<OuterT> {
        return toSkip && 0 < toSkip ? this.take(this.getCount() - toSkip) : this;
    }

    public take(toTake: number): Indexable<OuterT> {
        return toTake && 0 < toTake ? new TakeIndexable(this, toTake) : new ArrayList<OuterT>();
    }

    public takeLast(toTake: number): Indexable<OuterT> {
        let result: Indexable<OuterT>;
        if (!toTake || toTake < 0) {
            result = new ArrayList<OuterT>();
        }
        else {
            const count: number = this.getCount();
            if (count <= toTake) {
                result = this;
            }
            else {
                result = this.skip(count - toTake);
            }
        }
        return result;
    }

    public map<NewT>(mapFunction: (value: OuterT) => NewT): Indexable<NewT> {
        return mapFunction ? new MapIndexable<NewT, OuterT>(this, mapFunction) : new ArrayList<NewT>();
    }

    public concatenate(toConcatenate: Iterable<OuterT> | OuterT[]): Iterable<OuterT> {
        return toConcatenate ? new ConcatenateIterable<OuterT>(this, toConcatenate) : this;
    }

    public toArray(): OuterT[] {
        return this.iterate().toArray();
    }

    public endsWith(values: Iterable<OuterT>): boolean {
        let result: boolean;

        if (!values) {
            result = false;
        }
        else {
            const valuesCount: number = values.getCount();
            if (valuesCount === 0) {
                result = false;
            }
            else if (this.getCount() < valuesCount) {
                result = false;
            }
            else {
                result = true;

                const thisLastValuesIterator: Iterator<OuterT> = this.takeLast(valuesCount).iterate();
                const valuesIterator: Iterator<OuterT> = values.iterate();
                while (thisLastValuesIterator.next() === valuesIterator.next() && thisLastValuesIterator.hasCurrent()) {
                    if (thisLastValuesIterator.getCurrent() !== valuesIterator.getCurrent()) {
                        result = false;
                        break;
                    }
                }
            }
        }

        return result;
    }

    public minimum(lessThanComparison?: (lhs: OuterT, rhs: OuterT) => boolean): OuterT {
        return this.iterate().minimum(lessThanComparison);
    }

    public maximum(greaterThanComparison?: (lhs: OuterT, rhs: OuterT) => boolean): OuterT {
        return this.iterate().maximum(greaterThanComparison);
    }
}

class IndexableIterator<T> extends IteratorBase<T> {
    private _currentIndex: number;
    private _count: number;

    constructor(private _indexable: Indexable<T>) {
        super();
    }

    public hasStarted(): boolean {
        return isDefined(this._currentIndex);
    }

    public hasCurrent(): boolean {
        return this.hasStarted() && this._currentIndex < this._count;
    }

    public getCurrent(): T {
        return this.hasCurrent() ? this._indexable.get(this._currentIndex) : undefined;
    }

    public next(): boolean {
        if (!this.hasStarted()) {
            this._currentIndex = 0;
            this._count = this._indexable.getCount();
        }
        else if (this.hasCurrent()) {
            this._currentIndex++;
        }
        return this.hasCurrent();
    }
}

class IndexableReverseIterator<T> extends IteratorBase<T> {
    private _currentIndex: number;

    constructor(private _indexable: Indexable<T>) {
        super();
    }

    public hasStarted(): boolean {
        return isDefined(this._currentIndex);
    }

    public hasCurrent(): boolean {
        return this.hasStarted() && 0 <= this._currentIndex;
    }

    public getCurrent(): T {
        return this.hasCurrent() ? this._indexable.get(this._currentIndex) : undefined;
    }

    public next(): boolean {
        if (!this.hasStarted()) {
            this._currentIndex = this._indexable.getCount() - 1;
        }
        else if (this.hasCurrent()) {
            this._currentIndex--;
        }
        return this.hasCurrent();
    }
}

export interface List<T> extends Indexable<T> {
    add(value: T): void;

    addAll(values: T[] | Iterable<T>): void;

    /**
     * Remove all of the values from this List<T>.
     */
    clear(): void;
}

export abstract class ListBase<T> extends IndexableBase<T> implements List<T> {
    public abstract add(value: T): void;

    public addAll(values: T[] | Iterable<T>): void {
        if (values) {
            for (const value of values) {
                this.add(value);
            }
        }
    }

    public abstract clear(): void;
}

export class ArrayList<T> extends ListBase<T> {
    private _data: T[] = [];
    private _count: number = 0;

    constructor(values?: T[] | Iterable<T>) {
        super();

        this.addAll(values);
    }

    public iterate(): Iterator<T> {
        return new IndexableIterator<T>(this);
    }

    public iterateReverse(): Iterator<T> {
        return new IndexableReverseIterator<T>(this);
    }

    public get(index: number): T {
        let result: T;
        if (isDefined(index) && 0 <= index && index < this._count) {
            result = this._data[index];
        }
        return result;
    }

    public getFromEnd(index: number): T {
        return this.get((this.getCount() - 1) - index);
    }

    /**
     * Set the ArrayList value at the provided index to be the provided value. If the index is not
     * defined or is outside of the Arraylist's bounds, then this function will do nothing.
     */
    public set(index: number, value: T): void {
        if (isDefined(index) && 0 <= index && index < this._count) {
            this._data[index] = value;
        }
    }

    /**
     * Set the last ArrayList value to be the provided value. If the ArrayList is empty, then this
     * function will do nothing.
     */
    public setLast(value: T): void {
        if (this.any()) {
            this._data[this._count - 1] = value;
        }
    }

    public any(condition?: (value: T) => boolean): boolean {
        return condition ? super.any(condition) : this._count > 0;
    }

    public getCount(): number {
        return this._count;
    }

    public add(value: T): void {
        if (this._count === this._data.length) {
            this._data.push(value);
        }
        else {
            this._data[this._count] = value;
        }
        this._count++;
    }

    public removeAt(index: number): T {
        let result: T;
        if (isDefined(index) && 0 <= index && index < this._count) {
            result = this._data[index];

            for (let i = index; i < this._count - 1; ++i) {
                this._data[i] = this._data[i + 1];
            }
            this._data[this._count - 1] = undefined;
            this._count--;
        }
        return result;
    }

    /**
     * Remove the first instance of the provided value from this list.
     * @param value The value to remove.
     * @param comparer An optional comparer that will be used to determine if two values are equal.
     * If this is not provided, then the default strict equal comparison (===) will be used.
     */
    public remove(value: T, comparer?: (lhs: T, rhs: T) => boolean): T {
        let result: T;

        const removeIndex: number = this.indexOf(value, comparer);
        if (isDefined(removeIndex)) {
            result = this.removeAt(removeIndex);
        }

        return result;
    }

    public removeFirst(): T {
        return this.removeAt(0);
    }

    public removeLast(): T {
        return this.removeAt(this.getCount() - 1);
    }

    public clear(): void {
        this._count = 0;
    }
}

/**
 * A node that contains a value and a single link.
 */
export class SingleLinkNode<T> extends IterableBase<T> {
    constructor(private _value: T, private _next?: SingleLinkNode<T>) {
        super();
    }

    public iterate(): Iterator<T> {
        return new SingleLinkNodeIterator<T>(this);
    }

    /**
     * Get this Node's value.
     */
    public getValue(): T {
        return this._value;
    }

    /**
     * Set this Node's value.
     */
    public setValue(value: T) {
        this._value = value;
    }

    /**
     * Get the next Node in the chain.
     */
    public getNext(): SingleLinkNode<T> {
        return this._next;
    }

    /**
     * Set the next Node in the chain.
     */
    public setNext(next: SingleLinkNode<T>) {
        this._next = next;
    }
}

class SingleLinkNodeIterator<T> extends IteratorBase<T> {
    private _hasStarted: boolean = false;

    constructor(private _currentNode: SingleLinkNode<T>) {
        super();
    }

    public hasStarted(): boolean {
        return this._hasStarted;
    }

    public hasCurrent(): boolean {
        return this._hasStarted && this._currentNode ? true : false;
    }

    public getCurrent(): T {
        return this.hasCurrent() ? this._currentNode.getValue() : undefined;
    }

    public next(): boolean {
        if (!this.hasStarted()) {
            this._hasStarted = true;
        }
        else if (this._currentNode) {
            this._currentNode = this._currentNode.getNext();
        }

        return this.hasCurrent();
    }
}

export class SingleLinkList<T> extends ListBase<T> {
    private _head: SingleLinkNode<T>;
    private _tail: SingleLinkNode<T>;

    constructor(values?: T[] | Iterable<T>) {
        super();

        this.addAll(values);
    }

    public iterate(): Iterator<T> {
        return new SingleLinkNodeIterator<T>(this._head);
    }

    public iterateReverse(): Iterator<T> {
        return new IndexableReverseIterator<T>(this);
    }

    private getNode(index: number): SingleLinkNode<T> {
        let resultNode: SingleLinkNode<T>;
        if (0 <= index) {
            resultNode = this._head;
            while (resultNode && 0 < index) {
                resultNode = resultNode.getNext();
                --index;
            }
        }
        return resultNode;
    }

    public get(index: number): T {
        const resultNode: SingleLinkNode<T> = this.getNode(index);
        return resultNode ? resultNode.getValue() : undefined;
    }

    public getFromEnd(index: number): T {
        let resultNode: SingleLinkNode<T> = undefined;

        if (index >= 0) {
            let searchNode: SingleLinkNode<T> = this._head;
            while (searchNode && index > 0) {
                searchNode = searchNode.getNext();
                --index;
            }

            if (searchNode) {
                resultNode = this._head;
                while (searchNode.getNext()) {
                    resultNode = resultNode.getNext();
                    searchNode = searchNode.getNext();
                }
            }
        }

        return resultNode ? resultNode.getValue() : undefined;
    }

    /**
     * Set the ArrayList value at the provided index to be the provided value. If the index is not
     * defined or is outside of the Arraylist's bounds, then this function will do nothing.
     */
    public set(index: number, value: T): void {
        const node: SingleLinkNode<T> = this.getNode(index);
        if (node) {
            node.setValue(value);
        }
    }

    /**
     * Set the last ArrayList value to be the provided value. If the ArrayList is empty, then this
     * function will do nothing.
     */
    public setLast(value: T): void {
        if (this._tail) {
            this._tail.setValue(value);
        }
    }

    public any(condition?: (value: T) => boolean): boolean {
        return isDefined(this._head);
    }

    public getCount(): number {
        let count: number = 0;
        let searchNode: SingleLinkNode<T> = this._head;
        while (searchNode) {
            ++count;
            searchNode = searchNode.getNext();
        }
        return count;
    }

    public add(value: T): void {
        const nodeToAdd = new SingleLinkNode<T>(value);

        if (!this._head) {
            this._head = nodeToAdd;
            this._tail = nodeToAdd;
        }
        else {
            this._tail.setNext(nodeToAdd);
            this._tail = nodeToAdd;
        }
    }

    public removeAt(index: number): T {
        let result: T;
        if (isDefined(index) && 0 <= index) {
            if (index === 0) {
                if (this._head) {
                    result = this._head.getValue();
                    if (this._head === this._tail) {
                        this._head = undefined;
                        this._tail = undefined;
                    }
                    else {
                        this._head = this._head.getNext();
                    }
                }
            }
            else {
                const previousNode: SingleLinkNode<T> = this.getNode(index - 1);
                if (previousNode && previousNode.getNext()) {
                    result = previousNode.getNext().getValue();
                    previousNode.setNext(previousNode.getNext().getNext());
                }
            }
        }
        return result;
    }

    public remove(value: T, comparer?: (lhs: T, rhs: T) => boolean): T {
        if (!comparer) {
            comparer = (lhs: T, rhs: T) => lhs === rhs;
        }

        let previousNode: SingleLinkNode<T>;
        let searchNode: SingleLinkNode<T> = this._head;
        while (searchNode) {
            if (comparer(searchNode.getValue(), value)) {
                break;
            }
            else {
                previousNode = searchNode;
                searchNode = searchNode.getNext();
            }
        }

        if (searchNode) {
            if (!previousNode) {
                this._head = searchNode.getNext();
            }
            else {
                previousNode.setNext(searchNode.getNext());
            }

            if (searchNode === this._tail) {
                this._tail = previousNode;
            }
        }

        return searchNode ? searchNode.getValue() : undefined;
    }

    public removeFirst(): T {
        return this.removeAt(0);
    }

    public removeLast(): T {
        return this.removeAt(this.getCount() - 1);
    }

    public clear(): void {
        this._head = undefined;
        this._tail = undefined;
    }
}

/**
 * A node that contains a value and two links.
 */
export class DoubleLinkNode<T> {
    constructor(private _value: T, private _next?: DoubleLinkNode<T>, private _previous?: DoubleLinkNode<T>) {
    }

    /**
     * Get this Node's value.
     */
    public getValue(): T {
        return this._value;
    }

    /**
     * Set this Node's value.
     */
    public setValue(value: T) {
        this._value = value;
    }

    /**
     * Get the next Node in the chain.
     */
    public getNext(): DoubleLinkNode<T> {
        return this._next;
    }

    /**
     * Set the next Node in the chain.
     */
    public setNext(next: DoubleLinkNode<T>) {
        this._next = next;
    }

    /**
     * Get the previous Node in the chain.
     */
    public getPrevious(): DoubleLinkNode<T> {
        return this._previous;
    }

    /**
     * Set the previous Node in the chain.
     */
    public setPrevious(next: DoubleLinkNode<T>) {
        this._previous = next;
    }
}

export interface KeyValuePair<KeyType, ValueType> {
    key: KeyType;
    value: ValueType;
}

/**
 * A map/dictionary collection that associates a key to a value.
 */
export class Map<KeyType, ValueType> extends IterableBase<KeyValuePair<KeyType, ValueType>> {
    private _pairs = new ArrayList<KeyValuePair<KeyType, ValueType>>();

    constructor(initialValues?: KeyValuePair<KeyType, ValueType>[] | Iterable<KeyValuePair<KeyType, ValueType>>) {
        super();

        this.addAll(initialValues);
    }

    public iterate(): Iterator<KeyValuePair<KeyType, ValueType>> {
        return this._pairs.iterate();
    }

    public iterateReverse(): Iterator<KeyValuePair<KeyType, ValueType>> {
        return this._pairs.iterateReverse();
    }

    /**
     * Get the number of entries in this map.
     */
    public getCount(): number {
        return this._pairs.getCount();
    }

    /**
     * Add the provide key value pair to the Map. If an entry already exists with the provided key,
     * the existing entry will be overwritten by the provided values.
     */
    public add(key: KeyType, value: ValueType): void {
        this.remove(key);
        const pairToAdd: KeyValuePair<KeyType, ValueType> = {
            key: key,
            value: value
        };
        this._pairs.add(pairToAdd);
    }

    /**
     * Add each of the provided pairs to this Map. If any of the entries already exists with the
     * provided key, the existing entry will be overwritten by the provided value.
     */
    public addAll(keyValuePairs: KeyValuePair<KeyType, ValueType>[] | Iterable<KeyValuePair<KeyType, ValueType>>): void {
        if (keyValuePairs) {
            for (const keyValuePair of keyValuePairs) {
                this.add(keyValuePair.key, keyValuePair.value);
            }
        }
    }

    /**
     * Get whether or not the map contains the provided key.
     */
    public containsKey(key: KeyType): boolean {
        return this._pairs.any((pair) => pair.key === key);
    }

    /**
     * Get the value associated with the provided key. If the provided key is not found in the map,
     * then undefined will be returned.
     */
    public get(key: KeyType): ValueType {
        const pair: KeyValuePair<KeyType, ValueType> = this._pairs.first((pair) => pair.key === key);
        return pair ? pair.value : undefined;
    }

    /**
     * Remove the key/value pair with the provided key.
     * @param key The key of the key/value pair to remove from this Map.
     */
    public remove(key: KeyType): void {
        const pairToRemove: KeyValuePair<KeyType, ValueType> = {
            key: key,
            value: undefined
        };
        this._pairs.remove(pairToRemove, (lhs, rhs) => lhs.key === rhs.key);
    }
}

/**
 * A stack collection that can only add and remove elements from one end.
 */
export class Stack<T> {
    private _values = new ArrayList<T>();

    /**
     * Get whether or not this stack has any values.
     */
    public any(): boolean {
        return this._values.any();
    }

    /**
     * Get the number of values that are on the stack.
     */
    public getCount(): number {
        return this._values.getCount();
    }

    /**
     * Get whether this stack contains the provided value using the optional comparison. If the
     * comparison function is not provided, then === will be used.
     * @param value The value to search for in this stack.
     * @param comparison The optional comparison function to use to compare values.
     */
    public contains(value: T, comparison?: (lhs: T, rhs: T) => boolean): boolean {
        return this._values.contains(value, comparison);
    }

    /**
     * Add the provided value to the top of the stack.
     * @param value The value to add.
     */
    public push(value: T): void {
        this._values.add(value);
    }

    /**
     * Remove and return the value at the top of the stack.
     */
    public pop(): T {
        return this._values.removeLast();
    }

    /**
     * Return (but don't remove) the value at the top of the stack.
     */
    public peek(): T {
        return this._values.last();
    }
}

/**
 * A First-In-First-Out (FIFO) data structure.
 */
export class Queue<T> {
    private _values = new ArrayList<T>();

    /**
     * Get whether or not this queue has any values.
     */
    public any(): boolean {
        return this._values.any();
    }

    /**
     * Get the number of values that are in the queue.
     */
    public getCount(): number {
        return this._values.getCount();
    }

    /**
     * Get whether or not this queue contains the provided value using the optional comparison. If
     * The optional comparison is not provided, then === will be used.
     * @param value The value to search for.
     * @param comparison The optional comparison to compare values.
     */
    public contains(value: T, comparison?: (lhs: T, rhs: T) => boolean): boolean {
        return this._values.contains(value, comparison);
    }

    /**
     * Add the provided value to the start of this queue.
     * @param value The value to add to this queue.
     */
    public enqueue(value: T): void {
        this._values.add(value);
    }

    /**
     * Take the next value off of the end of this queue.
     */
    public dequeue(): T {
        return this._values.removeFirst();
    }
}

export function quote(value: string): string {
    let result: string;
    if (value === undefined) {
        result = "undefined";
    }
    else if (value === null) {
        result = "null";
    }
    else {
        result = `"${value}"`;
    }
    return result;
}

export function escape(documentText: string): string {
    let result: string = documentText;
    if (result) {
        let newResult: string = result;
        do {
            result = newResult;
            newResult = result.replace("\n", "\\n")
                .replace("\t", "\\t")
                .replace("\r", "\\r");
        }
        while (result !== newResult);
    }
    return result;
}

export function escapeAndQuote(text: string): string {
    return quote(escape(text));
}

export function toLowerCase(text: string): string {
    return text ? text.toLowerCase() : text;
}

export function isDefined(value: any): boolean {
    return value !== undefined && value !== null;
}

export function getLength(value: any[] | string): number {
    return isDefined(value) ? value.length : 0;
}

/**
 * Get the number of columns/character spaces for the provided value.
 * @param value The string to measure.
 * @param tabWidth The number of spaces that are equivalent to one tab's width.
 */
export function getStringWidth(value: string, tabWidth: number): number {
    let result: number = 0;

    if (value) {
        for (const character of value) {
            result += character === "\t" ? tabWidth : 1;
        }
    }

    return result;
}

export function startsWith(value: string, prefix: string): boolean {
    return value && prefix && (prefix === value.substr(0, prefix.length)) ? true : false;
}

export function startsWithIgnoreCase(value: string, prefix: string): boolean {
    return value && prefix && (prefix.toLowerCase() === value.substr(0, prefix.length).toLowerCase()) ? true : false;
}

/**
 * Get whether or not the provided value ends with the provided suffix.
 * @param value The value to check.
 * @param suffix The suffix to look for.
 */
export function endsWith(value: string, suffix: string): boolean {
    return value && suffix && value.length >= suffix.length && value.substring(value.length - suffix.length) === suffix ? true : false;
}

/**
 * Get whether or not the provided value contains the provided searchString.
 * @param value The value to look in.
 * @param searchString The string to search for.
 */
export function contains(value: string, searchString: string): boolean {
    return value && searchString && value.indexOf(searchString) !== -1 ? true : false;
}

/**
 * Remove the surrounding quotes from the provided string value if the string is quoted.
 * @param value The string to unquote.
 */
export function unquote(value: string): string {
    let result: string = value;
    if (value) {
        const valueLength: number = value.length;

        let resultStartIndex: number = 0;
        let resultLength: number = valueLength;

        const firstCharacter: string = value[0];
        const lastCharacter: string = value[valueLength - 1];
        if (firstCharacter === `"` || firstCharacter === `'`) {
            ++resultStartIndex;
            --resultLength;

            if (lastCharacter === firstCharacter) {
                --resultLength;
            }
        }
        else if (lastCharacter === `"` || lastCharacter === `'`) {
            --resultLength;
        }

        result = value.substr(resultStartIndex, resultLength);
    }
    return result;
}

/**
 * Repeat the provided value the provided count number of times.
 * @param value The value to repeat.
 * @param count The number of times to repeat the provided value.
 */
export function repeat(value: string, count: number): string {
    let result: string = "";
    if (value && count) {
        const countFloor: number = Math.floor(count);
        if (countFloor > 0) {
            for (let i = 0; i < countFloor; ++i) {
                result += value;
            }
        }
    }
    return result;
}

export function getLineIndex(value: string, characterIndex: number): number {
    let result: number;

    if (isDefined(value) && isDefined(characterIndex) && 0 <= characterIndex) {
        result = 0;
        for (let i = 0; i < characterIndex; ++i) {
            if (value[i] === "\n") {
                ++result;
            }
        }
    }

    return result;
}

export function getColumnIndex(value: string, characterIndex: number): number {
    let result: number;

    if (isDefined(value) && isDefined(characterIndex) && 0 <= characterIndex) {
        result = 0;
        for (let i = 0; i < characterIndex; ++i) {
            if (value[i] === "\n") {
                result = 0;
            }
            else {
                ++result;
            }
        }
    }

    return result;
}

export function getLineIndent(value: string, characterIndex: number): string {
    let result: string;

    const columnIndex: number = getColumnIndex(value, characterIndex);
    if (isDefined(columnIndex)) {
        let indentCharacterIndex: number = characterIndex - columnIndex;
        result = "";
        while (value[indentCharacterIndex] === " " || value[indentCharacterIndex] === "\t") {
            result += value[indentCharacterIndex];
            ++indentCharacterIndex;
        }
    }

    return result;
}

/**
 * A value that has a startIndex property.
 */
export interface HasStartIndex {
    startIndex: number;
}

/**
 * Get the start index of the provided values.
 * @param values
 */
export function getStartIndex(values: HasStartIndex[] | Iterable<HasStartIndex> | Iterator<HasStartIndex>): number {
    let result: number;
    if (values) {
        if (values instanceof Array) {
            if (values.length > 0) {
                result = values[0].startIndex;
            }
        }
        else {
            if (values.any()) {
                result = values.first().startIndex;
            }
        }
    }
    return result;
}

/**
 * A value that has an afterEndIndex property.
 */
export interface HasAfterEndIndex {
    afterEndIndex: number;
}

/**
 * Get the after end index of the provided values.
 * @param values
 */
export function getAfterEndIndex(values: HasAfterEndIndex[] | Iterable<HasAfterEndIndex>): number {
    let result: number;
    if (values) {
        if (values instanceof Array) {
            if (values.length > 0) {
                result = values[values.length - 1].afterEndIndex;
            }
        }
        else {
            if (values.any()) {
                result = values.last().afterEndIndex;
            }
        }
    }
    return result;
}

export function getSpan(values: HasStartIndexAndAfterEndIndex[] | Iterable<HasStartIndexAndAfterEndIndex>): Span {
    let result: Span;

    if (values) {
        if (values instanceof Array) {
            if (values.length > 0) {
                const startIndex: number = values[0].startIndex;
                const afterEndIndex: number = values[values.length - 1].afterEndIndex;
                result = new Span(startIndex, afterEndIndex - startIndex);
            }
        }
        else {
            if (values.any()) {
                const startIndex: number = values.first().startIndex;
                const afterEndIndex: number = values.last().afterEndIndex;
                result = new Span(startIndex, afterEndIndex - startIndex);
            }
        }
    }

    return result;
}

/**
 * An object that has a getLength() method.
 */
export interface HasGetLength {
    getLength(): number;
}

/**
 * Get the combined length of the values in the provided array.
 */
export function getCombinedLength(values: HasGetLength[] | Iterable<HasGetLength> | Iterator<HasGetLength>): number {
    let result: number = 0;
    if (values) {
        for (const value of values) {
            result += value.getLength();
        }
    }
    return result;
}

/**
 * A value that has startIndex and afterEndIndex properties.
 */
export interface HasStartIndexAndAfterEndIndex {
    startIndex: number;
    afterEndIndex: number;
}

/**
 * Get the combined length of the values in the provided array. This function assumes that the
 * values in the array don't have any gaps between them (the spans of the values are assumed to be
 * contiguous).
 */
export function getContiguousLength(values: HasStartIndexAndAfterEndIndex[] | Iterable<HasStartIndexAndAfterEndIndex>): number {
    let result: number;
    if (!values) {
        result = 0;
    }
    else {
        if (values instanceof Array) {
            result = values.length >= 1 ? values[values.length - 1].afterEndIndex - values[0].startIndex : 0;
        }
        else {
            result = values.any() ? values.last().afterEndIndex - values.first().startIndex : 0;
        }
    }
    return result;
}

/**
 * Get the combined text of the values in the provided array.
 */
export function getCombinedText(values: any[] | Iterable<any> | Iterator<any>): string {
    let result: string = "";
    if (values) {
        for (const value of values) {
            result += value.toString();
        }
    }
    return result;
}

/**
 * Create a deep copy of the provided value.
 */
export function clone<T>(value: T): T {
    let result: any;

    if (value === null ||
        value === undefined ||
        typeof value === "boolean" ||
        typeof value === "number" ||
        typeof value === "string") {
        result = value;
    }
    else if (value instanceof Array) {
        result = cloneArray(value);
    }
    else {
        result = {};
        for (const propertyName in value) {
            result[propertyName] = clone(value[propertyName]);
        }
    }

    return result;
}

export function cloneArray<T>(values: T[]): T[] {
    let result: T[];
    if (values === undefined) {
        result = undefined;
    }
    else if (values === null) {
        result = null;
    }
    else {
        result = [];
        for (const index in values) {
            result[index] = clone(values[index]);
        }
    }
    return result;
}

/**
 * Find the nearest package.json file by looking in the provided directory and each of its parent
 * directories.
 * @param parentPath The folder path to begin the search in.
 */
export function getPackageJson(parentPath: string): any {
    const fileName: string = "package.json";

    let packageJson: any = null;

    let packageJsonFilePath: string = "";
    while (parentPath && !packageJson) {
        const packageJsonFilePath: string = path.join(parentPath, fileName);
        if (fs.existsSync(packageJsonFilePath)) {
            packageJson = JSON.parse(fs.readFileSync(packageJsonFilePath, "utf-8"));
        }
        else {
            parentPath = path.dirname(parentPath);
        }
    }

    return packageJson
}

/**
 * A one-dimensional span object.
 */
export class Span {
    constructor(private _startIndex: number, private _length: number) {
    }

    /**
     * The inclusive index at which this Span starts.
     */
    public getStartIndex(): number {
        return this._startIndex;
    }

    /**
     * The length/number of indexes that this Span encompasses.
     */
    public getLength(): number {
        return this._length;
    }

    /**
     * The last index that is contained by this span.
     */
    public getEndIndex(): number {
        return this._length <= 0 ? this._startIndex : this.getAfterEndIndex() - 1;
    }

    /**
     * The first index after this span that is not contained by this span.
     */
    public getAfterEndIndex(): number {
        return this._startIndex + this._length;
    }

    /**
     * Convert this Span to its string representation.
     */
    public toString(): string {
        return `[${this._startIndex},${this.getAfterEndIndex()})`;
    }
}

/**
 * The different types of lexes.
 */
export const enum LexType {
    LeftCurlyBracket,
    RightCurlyBracket,
    LeftSquareBracket,
    RightSquareBracket,
    LeftAngleBracket,
    RightAngleBracket,
    LeftParenthesis,
    RightParenthesis,
    Letters,
    SingleQuote,
    DoubleQuote,
    Digits,
    Comma,
    Colon,
    Semicolon,
    ExclamationPoint,
    Backslash,
    ForwardSlash,
    QuestionMark,
    Dash,
    Plus,
    EqualsSign,
    Period,
    Underscore,
    Ampersand,
    VerticalBar,
    Space,
    Tab,
    CarriageReturn,
    NewLine,
    CarriageReturnNewLine,
    Asterisk,
    Percent,
    Hash,
    Unrecognized
}

/**
 * An individual lex from a lexer.
 */
export class Lex {
    constructor(private _text: string, private _startIndex: number, private _type: LexType) {
    }

    /**
     * The character index that this lex begins on.
     */
    public getStartIndex(): number {
        return this._startIndex;
    }

    public getAfterEndIndex(): number {
        return this._startIndex + this.getLength();
    }

    public getSpan(): Span {
        return new Span(this._startIndex, this.getLength());
    }

    /**
     * The string value for this token.
     */
    public toString(): string {
        return this._text;
    }

    /**
     * The length of the text of this token.
     */
    public getLength(): number {
        return this._text.length;
    }

    /**
     * The type of this token.
     */
    public getType(): LexType {
        return this._type;
    }

    public isWhitespace(): boolean {
        switch (this._type) {
            case LexType.Space:
            case LexType.Tab:
            case LexType.CarriageReturn:
                return true;

            default:
                return false;
        }
    }

    public isNewLine(): boolean {
        switch (this._type) {
            case LexType.CarriageReturnNewLine:
            case LexType.NewLine:
                return true;

            default:
                return false;
        }
    }
}

export function LeftCurlyBracket(startIndex: number): Lex {
    return new Lex("{", startIndex, LexType.LeftCurlyBracket);
}

export function RightCurlyBracket(startIndex: number): Lex {
    return new Lex("}", startIndex, LexType.RightCurlyBracket);
}

export function LeftSquareBracket(startIndex: number): Lex {
    return new Lex("[", startIndex, LexType.LeftSquareBracket);
}

export function RightSquareBracket(startIndex: number): Lex {
    return new Lex("]", startIndex, LexType.RightSquareBracket);
}

export function LeftAngleBracket(startIndex: number): Lex {
    return new Lex("<", startIndex, LexType.LeftAngleBracket);
}

export function RightAngleBracket(startIndex: number): Lex {
    return new Lex(">", startIndex, LexType.RightAngleBracket);
}

export function LeftParenthesis(startIndex: number): Lex {
    return new Lex("(", startIndex, LexType.LeftParenthesis);
}

export function RightParenthesis(startIndex: number): Lex {
    return new Lex(")", startIndex, LexType.RightParenthesis);
}

export function SingleQuote(startIndex: number): Lex {
    return new Lex("'", startIndex, LexType.SingleQuote);
}

export function DoubleQuote(startIndex: number): Lex {
    return new Lex("\"", startIndex, LexType.DoubleQuote);
}

export function Comma(startIndex: number): Lex {
    return new Lex(",", startIndex, LexType.Comma);
}

export function Colon(startIndex: number): Lex {
    return new Lex(":", startIndex, LexType.Colon);
}

export function Semicolon(startIndex: number): Lex {
    return new Lex(";", startIndex, LexType.Semicolon);
}

export function ExclamationPoint(startIndex: number): Lex {
    return new Lex("!", startIndex, LexType.ExclamationPoint);
}

export function Backslash(startIndex: number): Lex {
    return new Lex("\\", startIndex, LexType.Backslash);
}

export function ForwardSlash(startIndex: number): Lex {
    return new Lex("/", startIndex, LexType.ForwardSlash);
}

export function QuestionMark(startIndex: number): Lex {
    return new Lex("?", startIndex, LexType.QuestionMark);
}

export function Dash(startIndex: number): Lex {
    return new Lex("-", startIndex, LexType.Dash);
}

export function Plus(startIndex: number): Lex {
    return new Lex("+", startIndex, LexType.Plus);
}

export function EqualsSign(startIndex: number): Lex {
    return new Lex("=", startIndex, LexType.EqualsSign);
}

export function Period(startIndex: number): Lex {
    return new Lex(".", startIndex, LexType.Period);
}

export function Underscore(startIndex: number): Lex {
    return new Lex("_", startIndex, LexType.Underscore);
}

export function Ampersand(startIndex: number): Lex {
    return new Lex("&", startIndex, LexType.Ampersand);
}

export function VerticalBar(startIndex: number): Lex {
    return new Lex("|", startIndex, LexType.VerticalBar);
}

export function Space(startIndex: number): Lex {
    return new Lex(" ", startIndex, LexType.Space);
}

export function Tab(startIndex: number): Lex {
    return new Lex("\t", startIndex, LexType.Tab);
}

export function CarriageReturn(startIndex: number): Lex {
    return new Lex("\r", startIndex, LexType.CarriageReturn);
}

export function NewLine(startIndex: number): Lex {
    return new Lex("\n", startIndex, LexType.NewLine);
}

export function CarriageReturnNewLine(startIndex: number): Lex {
    return new Lex("\r\n", startIndex, LexType.NewLine);
}

export function Asterisk(startIndex: number): Lex {
    return new Lex("*", startIndex, LexType.Asterisk);
}

export function Percent(startIndex: number): Lex {
    return new Lex("%", startIndex, LexType.Percent);
}

export function Hash(startIndex: number): Lex {
    return new Lex("#", startIndex, LexType.Hash);
}

export function Letters(text: string, startIndex: number): Lex {
    return new Lex(text, startIndex, LexType.Letters);
}

export function Digits(text: string, startIndex: number): Lex {
    return new Lex(text, startIndex, LexType.Digits);
}

/**
 * Create an unrecognized token with the provided character string.
 */
export function Unrecognized(character: string, startIndex: number): Lex {
    return new Lex(character, startIndex, LexType.Unrecognized);
}

/**
 * A lexer that will break up a character stream into a stream of lexes.
 */
export class Lexer extends IteratorBase<Lex> {
    private _characters: Iterator<string>;
    private _hasStarted: boolean;
    private _currentLex: Lex;

    constructor(text: string) {
        super();

        this._characters = new StringIterator(text);
        this._hasStarted = false;
    }

    /**
     * Whether this object has started tokenizing its input stream or not.
     */
    public hasStarted(): boolean {
        return this._hasStarted;
    }

    /**
     * Get whether this tokenizer has a current token or not.
     */
    public hasCurrent(): boolean {
        return isDefined(this._currentLex);
    }

    /**
     * The current lex that has been lexed from the source character stream.
     */
    public getCurrent(): Lex {
        return this._currentLex;
    }

    /**
     * Get the next lex in the stream.
     */
    public next(): boolean {
        let lexStartIndex: number;

        if (!this._hasStarted) {
            lexStartIndex = 0;
            this._hasStarted = true;
            this._characters.next();
        }
        else if (this._currentLex) {
            lexStartIndex = this._currentLex.getAfterEndIndex();
        }

        if (this._characters.hasCurrent()) {
            const lexFirstCharacter: string = this._characters.getCurrent();
            switch (lexFirstCharacter) {
                case "{":
                    this._currentLex = LeftCurlyBracket(lexStartIndex);
                    this._characters.next();
                    break;

                case "}":
                    this._currentLex = RightCurlyBracket(lexStartIndex);
                    this._characters.next();
                    break;

                case "[":
                    this._currentLex = LeftSquareBracket(lexStartIndex);
                    this._characters.next();
                    break;

                case "]":
                    this._currentLex = RightSquareBracket(lexStartIndex);
                    this._characters.next();
                    break;

                case "(":
                    this._currentLex = LeftParenthesis(lexStartIndex);
                    this._characters.next();
                    break;

                case ")":
                    this._currentLex = RightParenthesis(lexStartIndex);
                    this._characters.next();
                    break;

                case "<":
                    this._currentLex = LeftAngleBracket(lexStartIndex);
                    this._characters.next();
                    break;

                case ">":
                    this._currentLex = RightAngleBracket(lexStartIndex);
                    this._characters.next();
                    break;

                case `"`:
                    this._currentLex = DoubleQuote(lexStartIndex);
                    this._characters.next();
                    break;

                case `'`:
                    this._currentLex = SingleQuote(lexStartIndex);
                    this._characters.next();
                    break;

                case "-":
                    this._currentLex = Dash(lexStartIndex);
                    this._characters.next();
                    break;

                case "+":
                    this._currentLex = Plus(lexStartIndex);
                    this._characters.next();
                    break;

                case ",":
                    this._currentLex = Comma(lexStartIndex);
                    this._characters.next();
                    break;

                case ":":
                    this._currentLex = Colon(lexStartIndex);
                    this._characters.next();
                    break;

                case ";":
                    this._currentLex = Semicolon(lexStartIndex);
                    this._characters.next();
                    break;

                case "!":
                    this._currentLex = ExclamationPoint(lexStartIndex);
                    this._characters.next();
                    break;

                case "\\":
                    this._currentLex = Backslash(lexStartIndex);
                    this._characters.next();
                    break;

                case "/":
                    this._currentLex = ForwardSlash(lexStartIndex);
                    this._characters.next();
                    break;

                case "?":
                    this._currentLex = QuestionMark(lexStartIndex);
                    this._characters.next();
                    break;

                case "=":
                    this._currentLex = EqualsSign(lexStartIndex);
                    this._characters.next();
                    break;

                case ".":
                    this._currentLex = Period(lexStartIndex);
                    this._characters.next();
                    break;

                case "_":
                    this._currentLex = Underscore(lexStartIndex);
                    this._characters.next();
                    break;

                case "&":
                    this._currentLex = Ampersand(lexStartIndex);
                    this._characters.next();
                    break;

                case " ":
                    this._currentLex = Space(lexStartIndex);
                    this._characters.next();
                    break;

                case "\t":
                    this._currentLex = Tab(lexStartIndex);
                    this._characters.next();
                    break;

                case "\r":
                    if (!this._characters.next() || this._characters.getCurrent() !== "\n") {
                        this._currentLex = CarriageReturn(lexStartIndex);
                    }
                    else {
                        this._currentLex = CarriageReturnNewLine(lexStartIndex);
                        this._characters.next();
                    }
                    break;

                case "\n":
                    this._currentLex = NewLine(lexStartIndex);
                    this._characters.next();
                    break;

                case "*":
                    this._currentLex = Asterisk(lexStartIndex);
                    this._characters.next();
                    break;

                case "%":
                    this._currentLex = Percent(lexStartIndex);
                    this._characters.next();
                    break;

                case "|":
                    this._currentLex = VerticalBar(lexStartIndex);
                    this._characters.next();
                    break;

                case "#":
                    this._currentLex = Hash(lexStartIndex);
                    this._characters.next();
                    break;

                default:
                    if (isLetter(lexFirstCharacter)) {
                        this._currentLex = Letters(readLetters(this._characters), lexStartIndex);
                    }
                    else if (isDigit(lexFirstCharacter)) {
                        this._currentLex = Digits(readDigits(this._characters), lexStartIndex);
                    }
                    else {
                        this._currentLex = Unrecognized(lexFirstCharacter, lexStartIndex);
                        this._characters.next();
                    }
                    break;
            }
        }
        else {
            this._currentLex = undefined;
        }

        return this.hasCurrent();
    }
}

export function readWhile(iterator: Iterator<string>, condition: (character: string) => boolean): string {
    if (!iterator.hasStarted()) {
        iterator.next();
    }

    let result: string = "";

    if (iterator.hasCurrent() && condition(iterator.getCurrent())) {
        result = iterator.getCurrent();
    }

    while (iterator.next() && condition(iterator.getCurrent())) {
        result += iterator.getCurrent();
    }

    return result;
}

export function readLetters(iterator: Iterator<string>): string {
    return readWhile(iterator, isLetter);
}

export function readWhitespace(iterator: Iterator<string>): string {
    return readWhile(iterator, isWhitespace);
}

export function readDigits(iterator: Iterator<string>): string {
    return readWhile(iterator, isDigit);
}

export function isWhitespace(value: string): boolean {
    switch (value) {
        case " ":
        case "\t":
        case "\r":
            return true;

        default:
            return false;
    }
}

/**
 * Is the provided character a letter?
 */
export function isLetter(character: string): boolean {
    return ("a" <= character && character <= "z") ||
        ("A" <= character && character <= "Z");
}

/**
 * Is the provided character a digit?
 */
export function isDigit(character: string): boolean {
    return "0" <= character && character <= "9";
}

export function absoluteValue(value: number): number {
    return value < 0 ? value * -1 : value;
}

export class StringIterator extends IteratorBase<string> {
    private _currentIndex: number;
    private _started: boolean = false;
    private _step: number;

    constructor(private _text: string, private _startIndex: number = 0, private _endIndex: number = getLength(_text)) {
        super();

        this._currentIndex = _startIndex;
        this._step = _endIndex >= _startIndex ? 1 : -1;
    }

    public hasStarted(): boolean {
        return this._started;
    }

    public hasCurrent(): boolean {
        return this.hasStarted() && this.hasMore();
    }

    public getCurrent(): string {
        return this.hasCurrent() ? this._text[this._currentIndex] : undefined;
    }

    public next(): boolean {
        if (this._started === false) {
            this._started = true;
        }
        else if (this.hasMore()) {
            this._currentIndex += this._step;
        }

        return this.hasMore();
    }

    private hasMore(): boolean {
        return (this._step > 0) ? this._currentIndex < this._endIndex : this._currentIndex > this._endIndex;
    }
}

export class StringIterable extends IterableBase<string> {
    constructor(private _text: string) {
        super();
    }

    public iterate(): Iterator<string> {
        return new StringIterator(this._text, 0, getLength(this._text));
    }

    public iterateReverse(): Iterator<string> {
        return new StringIterator(this._text, getLength(this._text) - 1, -1);
    }
}

/**
 * The different types of issues that can be found in a document.
 */
export const enum IssueType {
    Error,
    Warning
}

/**
 * An issue that is found in a document.
 */
export class Issue {
    constructor(private _message: string, private _span: Span, private _type: IssueType) {
    }

    /**
     * The user-friendly message that describes what this issue is about.
     */
    public getMessage(): string {
        return this._message;
    }

    /**
     * The character index span over which this issue applies.
     */
    public getSpan(): Span {
        return this._span;
    }

    /**
     * The character index at which this issue begins.
     */
    public getStartIndex(): number {
        return this._span.getStartIndex();
    }

    /**
     * The number of characters over which this issue applies.
     */
    public getLength(): number {
        return this._span.getLength();
    }

    /**
     * The index after the last index that this issue applies to.
     */
    public getAfterEndIndex(): number {
        return this._span.getAfterEndIndex();
    }

    /**
     * The type of this issue.
     */
    public getType(): IssueType {
        return this._type;
    }
}

/**
 * Get a new Error Issue with the provided message and span.
 */
export function Error(message: string, span: Span): Issue {
    return new Issue(message, span, IssueType.Error);
}

/**
 * Get a new Warning Issue with the provided message and span.
 */
export function Warning(message: string, span: Span): Issue {
    return new Issue(message, span, IssueType.Warning);
}