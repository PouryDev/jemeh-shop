@props([
    'label' => null,
    'name' => null,
])

<div class="space-y-1">
    @if($label)
        <label for="{{ $name }}" class="block text-xs text-gray-300">{{ $label }}</label>
    @endif
    <select id="{{ $name }}" name="{{ $name }}" {{ $attributes->merge(['class'=>'w-full rounded-lg bg-white/5 border border-white/10 focus:border-pink-600 focus:ring-2 focus:ring-pink-600/30 outline-none py-2.5 px-3 text-sm transition appearance-none']) }}>
        {{ $slot }}
    </select>
    @error($name)
        <div class="text-xs text-rose-400">{{ $message }}</div>
    @enderror
</div>


