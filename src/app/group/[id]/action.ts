'use server'

import { run } from '@/adapter/effect'
import { Person } from '@/domain'
import { getRequestContext } from '@cloudflare/next-on-pages'
import { Effect } from 'effect'
import { revalidatePath } from 'next/cache'

export async function addPerson(name: string, groupId: string) {
	return Effect.gen(function* () {
		yield* Person.Repository.insert(name, groupId)
	})
		.pipe(
			Effect.catchAll((e) => Effect.succeed(`Error ${JSON.stringify(e)}`)),
			run(getRequestContext().env.DB),
		)
		.then((result) => {
			if (typeof result === 'string') {
				return result
			}
			revalidatePath(`/group/${groupId}`)
		})
}
