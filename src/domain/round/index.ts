import { Schema } from '@effect/schema'
import { Effect, Option } from 'effect'
import { Pairing } from '..'
import { Person, type PersonId } from '../person'
import { Repository } from './repository'

export * from './repository'

export const Round = Schema.Struct({
	id: Schema.Number,
	group: Schema.String,
	at: Schema.String,
	persons: Schema.Array(Person),
	pairings: Schema.Array(Pairing.PairEntity),
})
export type Round = typeof Round.Type

export const newRound = (groupId: string, personIds: PersonId[]) =>
	Effect.gen(function* () {
		const { round } = yield* Repository.newRound(groupId, personIds)

		const pairings = yield* Pairing.pairPersons(groupId, personIds)

		if (Option.isSome(pairings)) {
			yield* Pairing.Repository.insert(round.id, pairings.value)
		}

		return { round, pairings }
	})

export const shufflePairings = (groupId: string) =>
	Effect.gen(function* () {
		const round = yield* Repository.findLast(groupId)
		if (Option.isNone(round)) {
			return yield* new NoRoundFound()
		}
		const personsInRound = yield* Repository.getPersonsInRound(round.value.id)
		const pairings = yield* Pairing.pairPersons(
			groupId,
			personsInRound.map((p) => p.person),
		)

		if (Option.isSome(pairings)) {
			yield* Pairing.Repository.deleteByRoundId(round.value.id)
			yield* Pairing.Repository.insert(round.value.id, pairings.value)
		}

		return { round: round.value, pairings }
	})

export const removePersonFromRound = (
	personId: PersonId,
	roundId: number,
	groupId: string,
) =>
	Effect.gen(function* () {
		const personInRound = yield* Repository.findPersonInRound(personId, roundId)
		if (Option.isSome(personInRound)) {
			yield* Repository.removePersonFromRound(personInRound.value.id)
		}
		const personsInRound = yield* Repository.getPersonsInRound(roundId)
		yield* Pairing.Repository.deleteByRoundId(roundId)
		const pairings = yield* Pairing.pairPersons(
			groupId,
			personsInRound.map((p) => p.person),
		)
		if (Option.isSome(pairings)) {
			yield* Pairing.Repository.insert(roundId, pairings.value)
		}
		return pairings
	})

export class NoRoundFound extends Schema.TaggedError<NoRoundFound>()(
	'NoRoundFound',
	{},
) {}
