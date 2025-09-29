@props([
    'label' => null,
    'name' => null,
    'checked' => false,
])

<label class="inline-flex items-center gap-2 text-sm text-gray-300 select-none">
    <input type="checkbox" name="{{ $name }}" @checked($checked) {{ $attributes->merge(['class'=>'rounded border-white/20 bg-white/10 text-pink-600 focus:ring-pink-600/40']) }}>
    @if($label)
        <span>{{ $label }}</span>
    @endif
</label>


