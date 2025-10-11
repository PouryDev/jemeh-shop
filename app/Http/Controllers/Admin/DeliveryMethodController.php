<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\DeliveryMethod;
use Illuminate\Http\Request;

class DeliveryMethodController extends Controller
{
    public function index()
    {
        $deliveryMethods = DeliveryMethod::orderBy('sort_order')->orderBy('id')->get();
        return view('admin.delivery-methods.index', compact('deliveryMethods'));
    }

    public function create()
    {
        return view('admin.delivery-methods.create');
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'fee' => 'required|integer|min:0',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ]);

        $data['is_active'] = $request->boolean('is_active');
        $data['sort_order'] = $data['sort_order'] ?? 0;

        DeliveryMethod::create($data);

        return redirect()->route('admin.delivery-methods.index')->with('success', 'روش ارسال ایجاد شد');
    }

    public function edit(DeliveryMethod $deliveryMethod)
    {
        return view('admin.delivery-methods.edit', compact('deliveryMethod'));
    }

    public function update(Request $request, DeliveryMethod $deliveryMethod)
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'fee' => 'required|integer|min:0',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ]);

        $data['is_active'] = $request->boolean('is_active');

        $deliveryMethod->update($data);

        return redirect()->route('admin.delivery-methods.index')->with('success', 'روش ارسال به‌روزرسانی شد');
    }

    public function destroy(DeliveryMethod $deliveryMethod)
    {
        $deliveryMethod->delete();
        return redirect()->route('admin.delivery-methods.index')->with('success', 'روش ارسال حذف شد');
    }

    public function toggleStatus(DeliveryMethod $deliveryMethod)
    {
        $deliveryMethod->update(['is_active' => !$deliveryMethod->is_active]);
        return back()->with('success', 'وضعیت به‌روزرسانی شد');
    }
}
