import {
  decodeCharacterData,
  type CharacterRecord,
  type SecondaryEntry,
  type ClassEntry,
} from './decode'

export { type CharacterRecord, type SecondaryEntry, type ClassEntry }

export default class Character {
  constructor(
    readonly records: CharacterRecord[],
    readonly secondary: SecondaryEntry[],
    readonly classes: ClassEntry[],
  ) {}

  static decode(bytes: Uint8Array): Character {
    const { records, secondary, classes } = decodeCharacterData(bytes)
    return new Character(records, secondary, classes)
  }
}
