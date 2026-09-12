import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateCategoryDto } from './application/dto/create-category.dto';
import { UpdateCategoryDto } from './application/dto/update-category.dto';

const errorsOf = async (dto: object) =>
  (await validate(dto)).flatMap((e) => Object.keys(e.constraints ?? {}));

describe('CreateCategoryDto', () => {
  const build = (payload: object) =>
    plainToInstance(CreateCategoryDto, payload);

  it('accepts a name with a six digit hex color', async () => {
    const errors = await validate(build({ name: 'Trabajo', color: '#FF5733' }));
    expect(errors).toHaveLength(0);
  });

  it('accepts a name without color, because the color is optional', async () => {
    const errors = await validate(build({ name: 'Trabajo' }));
    expect(errors).toHaveLength(0);
  });

  it('rejects an empty name', async () => {
    expect(await errorsOf(build({ name: '' }))).toContain('isNotEmpty');
  });

  it.each([
    ['a color without the leading hash', 'FF5733'],
    ['a three digit shorthand', '#fff'],
    ['a css color name', 'red'],
    ['a value that is not hexadecimal', '#GGGGGG'],
  ])('rejects %s', async (_case, color) => {
    expect(await errorsOf(build({ name: 'Trabajo', color }))).toContain(
      'matches',
    );
  });
});

describe('UpdateCategoryDto', () => {
  const build = (payload: object) =>
    plainToInstance(UpdateCategoryDto, payload);

  it('accepts an empty payload, because every field is optional', async () => {
    expect(await validate(build({}))).toHaveLength(0);
  });

  it('accepts updating only the color', async () => {
    expect(await validate(build({ color: '#00AA55' }))).toHaveLength(0);
  });

  it('rejects a malformed color', async () => {
    expect(await errorsOf(build({ color: 'FF5733' }))).toContain('matches');
  });
});
